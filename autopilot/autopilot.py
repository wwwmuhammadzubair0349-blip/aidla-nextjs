import os, re, sys, time, random, logging, requests, json
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

load_dotenv()

GROK_API_KEY  = os.getenv("GROK_API_KEY", "YOUR_GROK_API_KEY_HERE")
AIDLA_API_URL = "https://www.aidla.online/api/admin/upload-resource"
AIDLA_SECRET  = os.getenv("UPLOAD_API_SECRET", "aidla-upload-2026-secret")
CANONICAL_BASE = "https://www.aidla.online/resources"
DOWNLOAD_DIR  = Path("downloads")
LOG_DIR       = Path("logs")
UPLOADED_FILE = Path("uploaded.txt")
DOWNLOAD_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

log_file       = LOG_DIR / f"autopilot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
file_handler   = logging.FileHandler(log_file, encoding="utf-8")
stream_handler = logging.StreamHandler(sys.stdout)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s",
                    handlers=[file_handler, stream_handler])
log = logging.getLogger("aidla")

FILE_TYPES   = ["pdf", "ppt", "pptx", "doc", "docx"]
ARCHIVE_URL  = "https://archive.org/advancedsearch.php"
GROK_API_URL = "https://api.groq.com/openai/v1/chat/completions"

IRRELEVANT_KEYWORDS = [
    "cia", "rdp", "declassified", "soviet", "kgb", "fbi", "nsa", "dtic",
    "department of defense", "military", "army", "navy", "air force",
    "intelligence", "classified", "confidential", "government report",
    "paranormal", "psychic", "parapsychology", "extrasensory", "esp",
    "borderland", "telepathy", "occult", "supernatural", "ghost",
    "ufo", "alien", "astrology", "metaphysics", "tarot",
    "1800", "1810", "1820", "1830", "1840", "1850", "1860", "1870",
    "1880", "1890", "1900", "1910", "1911", "1912", "1913", "1914",
    "1915", "1916", "1917", "1918", "1919", "1920", "1921", "1922",
    "1923", "1924", "1925", "1926", "1927", "1928", "1929", "1930",
    "1931", "1932", "1933", "1934", "1935", "1936", "1937", "1938",
    "world war", "wwii", "ww2", "wwi", "ww1",
    "morocco", "dakhla", "desert economy", "sahara", "congress program",
    "soviet russia", "cold war",
    "aviation", "aircraft", "rigging", "aeroplan", "airship",
    "manual of hospital", "hospital planning",
    "arcade game", "video game manual", "biography",
    "journal of borderland", "encyclopaedia of am",
    "history of technol", "weston engineering",
    "terrance lindall", "borderland research",
    "electrotherapeutics", "med.yale", "surgery manual",
    "pharmaceutical", "clinical trial",
]

def is_relevant(title: str) -> bool:
    t = title.lower()
    academic_keywords = [
        "lecture", "notes", "textbook", "thesis", "paper", "study",
        "university", "college", "student", "course", "programming",
        "algorithm", "engineering", "science", "mathematics", "physics",
        "chemistry", "biology", "economics", "accounting", "network",
        "database", "software", "hardware", "data", "system", "analysis",
        "research", "introduction", "principles", "fundamentals",
        "template", "proposal", "report", "guide", "manual",
    ]
    has_academic   = any(kw in t for kw in academic_keywords)
    has_irrelevant = any(kw in t for kw in IRRELEVANT_KEYWORDS)
    return has_academic and not has_irrelevant

SEARCH_QUERIES = [
    # Books
    ("introduction algorithms cormen CLRS textbook pdf",           "books",       "Computer Science"),
    ("university physics serway jewett textbook pdf",              "books",       "Physics"),
    ("organic chemistry wade textbook university pdf",             "books",       "Chemistry"),
    ("software engineering sommerville textbook pdf",              "books",       "Software Engineering"),
    ("data structures algorithms Goodrich textbook pdf",           "books",       "Computer Science"),
    ("database systems elmasri navathe textbook pdf",              "books",       "Computer Science"),
    ("computer networks forouzan textbook pdf",                    "books",       "Networking"),
    ("artificial intelligence russell norvig textbook pdf",        "books",       "Artificial Intelligence"),
    ("principles economics mankiw textbook pdf",                   "books",       "Economics"),
    ("signals systems oppenheim textbook pdf",                     "books",       "Electrical Engineering"),
    ("digital communications proakis textbook pdf",                "books",       "Electrical Engineering"),
    ("compiler design aho ullman dragon book pdf",                 "books",       "Computer Science"),
    # Notes
    ("operating systems process scheduling lecture notes pdf",     "notes",       "Computer Science"),
    ("digital logic design gates flip-flops lecture notes pdf",    "notes",       "Computer Science"),
    ("power electronics inverter converter lecture notes pdf",     "notes",       "Electrical Engineering"),
    ("circuit theory kirchhoff mesh nodal lecture notes pdf",      "notes",       "Electrical Engineering"),
    ("thermodynamics entropy heat transfer lecture notes pdf",     "notes",       "Mechanical Engineering"),
    ("differential equations solution lecture notes pdf",          "notes",       "Mathematics"),
    ("probability distributions statistics lecture notes pdf",     "notes",       "Statistics"),
    ("python programming functions OOP lecture notes pdf",         "notes",       "Computer Science"),
    ("deep learning backpropagation CNN lecture notes pdf",        "notes",       "Artificial Intelligence"),
    ("financial accounting balance sheet lecture notes pdf",       "notes",       "Accounting"),
    ("macroeconomics fiscal monetary policy lecture notes pdf",    "notes",       "Economics"),
    ("human anatomy physiology cells lecture notes pdf",           "notes",       "Biology"),
    ("organic chemistry reactions mechanism lecture notes pdf",    "notes",       "Chemistry"),
    ("computer architecture cache pipeline lecture notes pdf",     "notes",       "Computer Science"),
    # Past Papers
    ("CSS past papers solved Pakistan competitive exam",           "past_papers", "General"),
    ("NTS past papers solved Pakistan test preparation",           "past_papers", "General"),
    ("GRE past papers solved mathematics verbal",                  "past_papers", "General"),
    # Thesis
    ("thesis machine learning classification deep learning",       "thesis",      "Artificial Intelligence"),
    ("thesis solar energy photovoltaic renewable",                 "thesis",      "Electrical Engineering"),
    ("thesis NLP text classification sentiment analysis",          "thesis",      "Computer Science"),
    ("thesis network intrusion detection cybersecurity",           "thesis",      "Networking"),
    ("thesis image recognition convolutional neural network",      "thesis",      "Artificial Intelligence"),
    ("thesis IoT smart home automation system",                    "thesis",      "Electrical Engineering"),
    # Templates
    ("research proposal template computer science students",       "templates",   "General"),
    ("technical report template engineering university",           "templates",   "General"),
    ("project documentation template software engineering",        "templates",   "General"),
]

# ── History tracking ──
# Format: identifier|original_title|original_filename|archive_url|canonical_url|seo_slug
def load_uploaded() -> set:
    if UPLOADED_FILE.exists():
        return set(UPLOADED_FILE.read_text(encoding="utf-8").splitlines())
    return set()

def mark_uploaded(identifier: str, original_title: str, original_filename: str,
                  archive_url: str, canonical_url: str, seo_slug: str):
    try:
        with open(UPLOADED_FILE, "a", encoding="utf-8") as f:
            line = "|".join([
                identifier.lower().strip(),
                original_title.lower().strip(),
                original_filename.lower().strip(),
                archive_url.strip(),
                canonical_url.strip(),
                seo_slug.lower().strip(),
            ]) + "\n"
            f.write(line)
            f.flush()
            os.fsync(f.fileno())
        log.info(f"        Tracked: {identifier} | {canonical_url}")
    except Exception as e:
        log.error(f"        Failed to write uploaded.txt: {e}")

def is_duplicate(already_done: set, identifier: str, original_title: str,
                 original_filename: str, seo_slug: str) -> bool:
    id_l    = identifier.lower().strip()
    title_l = original_title.lower().strip()
    file_l  = original_filename.lower().strip()
    slug_l  = seo_slug.lower().strip()

    for entry in already_done:
        parts = entry.split("|")
        if not parts:
            continue
        # Check identifier (part 0) — same in both old and new format
        if parts[0] == id_l:
            log.info(f"        Duplicate identifier: {identifier}")
            return True
        if len(parts) >= 6:
            # New format: identifier|original_title|original_filename|archive_url|canonical_url|seo_slug
            if parts[1] == title_l:
                log.info(f"        Duplicate original_title: {original_title[:60]}")
                return True
            if parts[2] == file_l:
                log.info(f"        Duplicate original_filename: {original_filename}")
                return True
            if parts[5] == slug_l:
                log.info(f"        Duplicate seo_slug: {seo_slug}")
                return True
        elif len(parts) >= 3:
            # Old 3-part format: identifier|title|slug
            if parts[1] == title_l:
                log.info(f"        Duplicate title (legacy): {original_title[:60]}")
                return True
            if parts[2] == slug_l:
                log.info(f"        Duplicate slug (legacy): {seo_slug}")
                return True
    return False

# ── Slug generator ──
def make_slug(title: str) -> str:
    s = re.sub(r"['\"]", "", title.lower().strip())
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or f"material-{int(time.time())}"

# ── Archive.org search ──
def search_archive(query, page=1, num_results=10):
    log.info(f"[SEARCH] {query} (page {page})")
    params = {
        "q":      f"{query} AND mediatype:texts",
        "fl[]":   ["identifier", "title", "description", "subject", "year"],
        "rows":   num_results,
        "page":   page,
        "output": "json",
        "sort[]": "downloads desc",
    }
    try:
        r = requests.get(ARCHIVE_URL, params=params, timeout=20)
        r.raise_for_status()
        docs = r.json().get("response", {}).get("docs", [])
        log.info(f"        Found {len(docs)} results")
        return docs
    except Exception as e:
        log.error(f"Search failed: {e}")
        return []

def get_download_url(identifier, max_bytes=5*1024*1024):
    try:
        r = requests.get(f"https://archive.org/metadata/{identifier}", timeout=15)
        r.raise_for_status()
        files = r.json().get("files", [])
        for ext in FILE_TYPES:
            for f in files:
                name = f.get("name", "")
                if not name.lower().endswith(f".{ext}"):
                    continue
                size = int(f.get("size", 0))
                if size > max_bytes:
                    log.warning(f"        Pre-skip (too large {size//1024}KB): {name}")
                    continue
                if size == 0:
                    continue
                return f"https://archive.org/download/{identifier}/{name}", name, size
    except Exception as e:
        log.error(f"Metadata failed {identifier}: {e}")
    return None, None, 0

def download_file(url, filename):
    dest = DOWNLOAD_DIR / filename
    if dest.exists():
        return dest
    try:
        log.info(f"        Downloading: {filename}")
        r = requests.get(url, timeout=90, stream=True)
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        log.info(f"        Done: {dest.stat().st_size // 1024} KB")
        return dest
    except Exception as e:
        log.error(f"Download failed: {e}")
        return None

# ── Grok SEO generation ──
def grok_generate(filename, raw_title, raw_desc, category, subject):
    log.info("        Asking Grok (SEO mode)...")
    prompt = (
        "You are an SEO expert for AIDLA - Pakistan #1 AI Learning Academy (aidla.online).\n\n"
        f"Document details:\n"
        f"- Filename: {filename}\n"
        f"- Raw title: {raw_title}\n"
        f"- Raw description: {str(raw_desc)[:300] if raw_desc else 'N/A'}\n"
        f"- Category: {category} | Subject: {subject}\n\n"
        "RULES:\n"
        "1. TITLE: 6-10 words. Specific topic from filename + doc type. "
        "NO generic titles. Example: 'Power Systems Protection Notes for BS Students'\n"
        "2. META_TITLE: max 60 chars. Format: '[Topic] [DocType] Free PDF | AIDLA Pakistan'. "
        "Example: 'CLRS Algorithms Textbook Free PDF | AIDLA Pakistan'\n"
        "3. META_DESCRIPTION: 150-158 chars exactly. Include: specific topic, free download, "
        "Pakistan, subject, CTA. Example: 'Download free CLRS Introduction to Algorithms PDF for "
        "BS Computer Science students in Pakistan. Covers sorting, graphs & DP. Free on AIDLA.'\n"
        "4. DESCRIPTION: 4 sentences. Specific topic, who benefits, Pakistan keywords, CTA.\n"
        "5. SLUG: lowercase hyphens, topic-specific. Example: clrs-algorithms-textbook-pdf-pakistan\n"
        "6. TAGS: 10 comma-separated: specific topic, subject, doc type, level, pakistan, "
        "NUST/FAST/UET/LUMS/COMSATS (pick most relevant), free, pdf, aidla, 2024\n\n"
        'Respond ONLY as valid JSON: {"title":"...","meta_title":"...","meta_description":"...",'
        '"description":"...","slug":"...","tags":"..."}'
    )
    try:
        r = requests.post(GROK_API_URL, json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 600, "temperature": 0.6,
        }, headers={
            "Authorization": f"Bearer {GROK_API_KEY}",
            "Content-Type": "application/json"
        }, timeout=30)
        r.raise_for_status()
        txt = r.json()["choices"][0]["message"]["content"].strip()
        m = re.search(r"\{.*\}", txt, re.DOTALL)
        if m:
            data = json.loads(m.group())
            data["slug"] = make_slug(data.get("slug") or data.get("title") or raw_title or filename)
            log.info(f"        SEO title      : {data.get('title')}")
            log.info(f"        meta_title     : {data.get('meta_title')}")
            log.info(f"        meta_desc len  : {len(data.get('meta_description',''))}")
            log.info(f"        SEO slug       : {data.get('slug')}")
            return data
    except Exception as e:
        log.error(f"Grok failed: {e}")
    slug = make_slug(raw_title or filename)
    fallback_meta_title = f"{(raw_title or subject or 'Study Material')[:45]} Free PDF | AIDLA Pakistan"
    fallback_meta_desc  = (
        f"Download free {raw_title or subject or 'study material'} PDF for university students in Pakistan. "
        f"Perfect for {subject} students. Free download on AIDLA - Pakistan's #1 learning platform."
    )[:158]
    return {
        "title":            raw_title or filename,
        "meta_title":       fallback_meta_title,
        "meta_description": fallback_meta_desc,
        "description":      raw_desc or "",
        "slug":             slug,
        "tags":             f"{subject.lower()},pdf,free,pakistan,{category},aidla,2024",
    }

# ── Upload to AIDLA ──
def upload_to_aidla(file_path, title, meta_title, meta_description,
                    description, category, subject, year="", tags="", slug=""):
    log.info(f"        Uploading: {title}")
    try:
        with open(file_path, "rb") as f:
            payload = {
                "secret_key":       AIDLA_SECRET,
                "grok_title":       title,
                "grok_description": description,
                "meta_title":       meta_title,
                "meta_description": meta_description,
                "category":         category,
                "subject":          subject,
                "year":             year,
                "tags":             tags,
                "language":         "en",
                "access":           "free",
                "status":           "published",
            }
            if slug:
                payload["slug"] = slug
            r = requests.post(AIDLA_API_URL,
                files={"file": (file_path.name, f, "application/octet-stream")},
                data=payload, timeout=120)
        result = r.json()
        if result.get("ok"):
            returned_slug = result.get("slug", slug)
            canonical = f"{CANONICAL_BASE}/{returned_slug}"
            log.info(f"        UPLOADED! canonical={canonical}")
            return True, returned_slug, canonical
        log.error(f"        Failed: {result.get('error')}")
        return False, slug, ""
    except Exception as e:
        log.error(f"        Error: {e}")
        return False, slug, ""

# ── MAIN ──
def run_autopilot(max_uploads=50, delay_seconds=8):
    log.info("=" * 50)
    log.info("AIDLA AUTOPILOT STARTED")
    log.info(f"Target: {max_uploads} uploads | Delay: {delay_seconds}s")
    log.info("=" * 50)

    uploaded     = 0
    already_done = load_uploaded()
    queries      = list(SEARCH_QUERIES)
    random.shuffle(queries)

    for query, category, subject in queries:
        if uploaded >= max_uploads:
            break

        for page in [1, 2, 3]:
            if uploaded >= max_uploads:
                break

            docs = search_archive(query, page=page, num_results=10)
            if not docs:
                break

            for doc in docs:
                if uploaded >= max_uploads:
                    break

                identifier = doc.get("identifier", "")
                if not identifier:
                    continue

                original_title    = doc.get("title", "") or ""
                archive_url       = f"https://archive.org/details/{identifier}"

                if not is_relevant(original_title):
                    log.warning(f"        Irrelevant skipped: {original_title[:60]}")
                    continue

                url, original_filename, filesize = get_download_url(identifier)
                if not url:
                    log.warning(f"        No suitable file: {identifier}")
                    continue

                # Early duplicate check using original data before downloading
                if is_duplicate(already_done, identifier, original_title, original_filename or "", ""):
                    log.info(f"        Pre-skip duplicate: {identifier}")
                    continue

                file_path = download_file(url, original_filename)
                if not file_path:
                    continue

                ai             = grok_generate(original_filename, original_title,
                                               doc.get("description",""), category, subject)
                seo_title      = ai.get("title", original_title or original_filename)
                meta_title     = ai.get("meta_title", "")
                meta_desc      = ai.get("meta_description", "")
                desc           = ai.get("description", "")
                seo_slug       = ai.get("slug", "")
                tags           = ai.get("tags", f"{subject.lower()},pdf,free,pakistan,{category}")

                # Full duplicate check with SEO slug
                if is_duplicate(already_done, identifier, original_title, original_filename or "", seo_slug):
                    if file_path.exists():
                        file_path.unlink()
                    continue

                ok, returned_slug, canonical_url = upload_to_aidla(
                    file_path, seo_title, meta_title, meta_desc, desc,
                    category, subject, str(doc.get("year", "")), tags, seo_slug
                )

                if ok:
                    uploaded += 1
                    mark_uploaded(
                        identifier, original_title, original_filename or "",
                        archive_url, canonical_url, returned_slug
                    )
                    already_done.add("|".join([
                        identifier.lower().strip(),
                        original_title.lower().strip(),
                        (original_filename or "").lower().strip(),
                        archive_url,
                        canonical_url,
                        returned_slug.lower().strip(),
                    ]))
                    log.info(f"--- Progress: {uploaded}/{max_uploads} ---")
                    file_path.unlink()

                time.sleep(delay_seconds)

            time.sleep(2)

    log.info("=" * 50)
    log.info(f"DONE -- {uploaded} files uploaded!")
    log.info("=" * 50)

if __name__ == "__main__":
    run_autopilot(max_uploads=50, delay_seconds=8)
