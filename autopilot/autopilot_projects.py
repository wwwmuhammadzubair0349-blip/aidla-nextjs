import os, re, sys, time, random, logging, requests, json
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

load_dotenv()

GROK_API_KEY   = os.getenv("GROK_API_KEY", "YOUR_GROK_API_KEY_HERE")
AIDLA_API_URL  = "https://www.aidla.online/api/admin/upload-project"
AIDLA_SECRET   = os.getenv("UPLOAD_API_SECRET", "aidla-upload-2026-secret")
CANONICAL_BASE = "https://www.aidla.online/projects"
DOWNLOAD_DIR   = Path("downloads_projects")
LOG_DIR        = Path("logs")
UPLOADED_FILE  = Path("uploaded_projects.txt")
DOWNLOAD_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

log_file       = LOG_DIR / f"projects_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
file_handler   = logging.FileHandler(log_file, encoding="utf-8")
stream_handler = logging.StreamHandler(sys.stdout)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s",
                    handlers=[file_handler, stream_handler])
log = logging.getLogger("aidla_projects")

FILE_TYPES   = ["pdf", "doc", "docx", "ppt", "pptx", "zip", "csv"]
ARCHIVE_URL  = "https://archive.org/advancedsearch.php"
GROK_API_URL = "https://api.groq.com/openai/v1/chat/completions"

DOMAINS      = ["web", "mobile", "ai_ml", "iot", "blockchain",
                "data_science", "cybersecurity", "ar_vr", "other"]
TYPES        = ["fyp", "mini_project", "semester", "research", "internship", "other"]
DIFFICULTIES = ["beginner", "intermediate", "advanced"]

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

# (query, type, domain, difficulty, subject)
SEARCH_QUERIES = [
    # FYP
    ("final year project computer science proposal",     "fyp",          "web",           "advanced",     "Computer Science"),
    ("final year project machine learning proposal",     "fyp",          "ai_ml",         "advanced",     "Artificial Intelligence"),
    ("final year project mobile app proposal",          "fyp",          "mobile",         "advanced",     "Software Engineering"),
    ("final year project IoT smart home proposal",      "fyp",          "iot",            "advanced",     "Electrical Engineering"),
    ("final year project cybersecurity proposal",       "fyp",          "cybersecurity",  "advanced",     "Cybersecurity"),
    ("final year project data science proposal",        "fyp",          "data_science",   "advanced",     "Data Science"),
    ("final year project blockchain proposal",          "fyp",          "blockchain",     "advanced",     "Computer Science"),
    # Research
    ("research proposal computer science students",     "research",     "ai_ml",          "advanced",     "Computer Science"),
    ("research proposal deep learning",                 "research",     "ai_ml",          "advanced",     "Artificial Intelligence"),
    ("research proposal data mining",                   "research",     "data_science",   "advanced",     "Data Science"),
    ("research proposal natural language processing",   "research",     "ai_ml",          "advanced",     "Artificial Intelligence"),
    ("research proposal cybersecurity network",         "research",     "cybersecurity",  "advanced",     "Cybersecurity"),
    ("research proposal IoT smart systems",             "research",     "iot",            "intermediate", "Electrical Engineering"),
    # Mini Projects
    ("mini project web development students",           "mini_project", "web",            "beginner",     "Web Development"),
    ("mini project python beginners",                   "mini_project", "ai_ml",          "beginner",     "Computer Science"),
    ("mini project android app students",               "mini_project", "mobile",         "intermediate", "Software Engineering"),
    ("mini project database management system",         "mini_project", "web",            "intermediate", "Database Systems"),
    ("mini project machine learning classification",    "mini_project", "ai_ml",          "intermediate", "Artificial Intelligence"),
    # Semester Projects
    ("semester project software engineering students",  "semester",     "web",            "intermediate", "Software Engineering"),
    ("semester project data structures algorithms",     "semester",     "other",          "intermediate", "Computer Science"),
    ("semester project operating systems",              "semester",     "other",          "intermediate", "Computer Science"),
    ("semester project computer networks",              "semester",     "cybersecurity",  "intermediate", "Networking"),
    ("semester project database design university",     "semester",     "web",            "intermediate", "Database Systems"),
    # Thesis
    ("thesis proposal computer science university",     "research",     "ai_ml",          "advanced",     "Computer Science"),
    ("thesis proposal electrical engineering",          "research",     "iot",            "advanced",     "Electrical Engineering"),
    ("thesis proposal software engineering",            "research",     "web",            "advanced",     "Software Engineering"),
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
        log.error(f"        Failed to write uploaded_projects.txt: {e}")

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
        if parts[0] == id_l:
            log.info(f"        Duplicate identifier: {identifier}")
            return True
        if len(parts) >= 6:
            # New format
            if parts[1] == title_l:
                log.info(f"        Duplicate original_title: {original_title[:60]}")
                return True
            if file_l and parts[2] == file_l:
                log.info(f"        Duplicate original_filename: {original_filename}")
                return True
            if slug_l and parts[5] == slug_l:
                log.info(f"        Duplicate seo_slug: {seo_slug}")
                return True
        elif len(parts) >= 3:
            # Old 3-part format: identifier|title|slug
            if parts[1] == title_l:
                log.info(f"        Duplicate title (legacy): {original_title[:60]}")
                return True
            if slug_l and parts[2] == slug_l:
                log.info(f"        Duplicate slug (legacy): {seo_slug}")
                return True
    return False

# ── Slug generator ──
def make_slug(title: str) -> str:
    s = re.sub(r"['\"]", "", title.lower().strip())
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or f"project-{int(time.time())}"

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
def grok_generate(filename, raw_title, raw_desc, proj_type, domain, difficulty, subject):
    log.info("        Asking Grok (SEO mode)...")
    prompt = (
        "You are an SEO expert for AIDLA - Pakistan #1 AI Learning Academy (aidla.online).\n"
        f"Filename   : {filename}\n"
        f"Raw title  : {raw_title}\n"
        f"Description: {str(raw_desc)[:300] if raw_desc else 'N/A'}\n"
        f"Type       : {proj_type} | Domain: {domain} | Difficulty: {difficulty} | Subject: {subject}\n\n"
        "RULES:\n"
        "1. TITLE: 6-10 words. Include project type (FYP/Mini Project/Research Proposal/Semester Project) "
        "+ specific domain keyword. Example: 'AI-Based Disease Detection FYP Project Proposal'\n"
        "2. META_TITLE: max 60 chars. Format: '[Project] Free Download | AIDLA Pakistan'. "
        "Example: 'AI Disease Detection FYP Proposal Free | AIDLA Pakistan'\n"
        "3. META_DESCRIPTION: 150-158 chars exactly. Include: project type, domain, Pakistan, "
        "free download, target students (BS/MS), CTA. "
        "Example: 'Download free AI-based Disease Detection FYP proposal for BS students in Pakistan. "
        "Includes system design & implementation. Free PDF on AIDLA.'\n"
        "4. DESCRIPTION: 4 sentences. What it is. Who it helps. "
        "Keywords: free download, PDF, Pakistan, university. CTA.\n"
        "5. SLUG: lowercase hyphens. Topic-specific. "
        "Example: ai-disease-detection-fyp-project-pakistan\n"
        "6. TAGS: 10 comma-separated: project type, domain, subject, difficulty, "
        "NUST/FAST/UET/LUMS/COMSATS (most relevant), pakistan, free, pdf, aidla, 2024\n"
        "7. TECH_STACK: 3-5 comma-separated technologies.\n"
        "8. FEATURES: 3 key features, pipe-separated.\n\n"
        'Respond ONLY as valid JSON: {"title":"...","meta_title":"...","meta_description":"...",'
        '"description":"...","slug":"...","tags":"...","tech_stack":"...","features":"..."}'
    )
    try:
        r = requests.post(GROK_API_URL, json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 700, "temperature": 0.6,
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
    fallback_meta_title = f"{proj_type.upper()} {subject} Project Free | AIDLA Pakistan"[:60]
    fallback_meta_desc  = (
        f"Download free {proj_type.replace('_',' ')} project proposal for {subject} students in Pakistan. "
        f"Perfect for BS/MS {domain} projects. Free PDF on AIDLA."
    )[:158]
    return {
        "title":            raw_title or filename,
        "meta_title":       fallback_meta_title,
        "meta_description": fallback_meta_desc,
        "description":      raw_desc or "",
        "slug":             slug,
        "tags":             f"{subject.lower()},project,{domain},{proj_type},pakistan,free,pdf,aidla,2024",
        "tech_stack":       "",
        "features":         "",
    }

# ── Upload to AIDLA ──
def upload_to_aidla(file_path, title, meta_title, meta_description, description,
                    slug, proj_type, domain, difficulty, subject,
                    tags, tech_stack, features, year=""):
    log.info(f"        Uploading project: {title}")
    try:
        features_list = [f.strip() for f in features.split("|") if f.strip()]
        tech_list     = [t.strip() for t in tech_stack.split(",") if t.strip()]
        tags_list     = [t.strip() for t in tags.split(",") if t.strip()]

        if file_path and file_path.exists():
            ext = file_path.suffix.lower()
            mime_map = {
                ".pdf":  "application/pdf",
                ".doc":  "application/msword",
                ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".ppt":  "application/vnd.ms-powerpoint",
                ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".zip":  "application/zip",
                ".csv":  "text/csv",
            }
            mime    = mime_map.get(ext, "application/pdf")
            file_obj = open(file_path, "rb")
            files   = {"file": (file_path.name, file_obj, mime)}
        else:
            files    = {}
            file_obj = None

        data = {
            "secret_key":          AIDLA_SECRET,
            "title":               title,
            "meta_title":          meta_title,
            "meta_description":    meta_description,
            "description":         description,
            "slug":                slug,
            "type":                proj_type,
            "domain":              domain,
            "difficulty":          difficulty,
            "subject":             subject,
            "year":                year,
            "tags":                ",".join(tags_list),
            "tech_stack":          ",".join(tech_list),
            "features":            "\n".join(features_list),
            "educational_level":   "BS",
            "team_size_min":       "1",
            "team_size_max":       "4",
            "estimated_duration":  "3 months",
            "language":            "en",
            "status":              "published",
            "upload_type":         "project",
        }

        r = requests.post(
            AIDLA_API_URL,
            files=files if files else None,
            data=data,
            timeout=120
        )
        if file_obj:
            file_obj.close()

        result = r.json()
        if result.get("ok"):
            returned_slug  = result.get("slug", slug)
            canonical      = f"{CANONICAL_BASE}/{returned_slug}"
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
    log.info("AIDLA PROJECTS AUTOPILOT STARTED")
    log.info(f"Target: {max_uploads} uploads | Delay: {delay_seconds}s")
    log.info("=" * 50)

    uploaded     = 0
    already_done = load_uploaded()
    queries      = list(SEARCH_QUERIES)
    random.shuffle(queries)

    for query, proj_type, domain, difficulty, subject in queries:
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

                # Early duplicate check before downloading
                if is_duplicate(already_done, identifier, original_title, original_filename or "", ""):
                    log.info(f"        Pre-skip duplicate: {identifier}")
                    continue

                file_path = download_file(url, original_filename)
                if not file_path:
                    continue

                ai         = grok_generate(original_filename, original_title,
                                           doc.get("description",""),
                                           proj_type, domain, difficulty, subject)
                seo_title  = ai.get("title", original_title or original_filename)
                meta_title = ai.get("meta_title", "")
                meta_desc  = ai.get("meta_description", "")
                desc       = ai.get("description", "")
                seo_slug   = ai.get("slug", "")
                tags       = ai.get("tags", f"{subject.lower()},project,{domain},{proj_type},pakistan,free")
                tech_stack = ai.get("tech_stack", "")
                features   = ai.get("features", "")

                # Full duplicate check with SEO slug
                if is_duplicate(already_done, identifier, original_title, original_filename or "", seo_slug):
                    if file_path.exists():
                        file_path.unlink()
                    continue

                ok, returned_slug, canonical_url = upload_to_aidla(
                    file_path, seo_title, meta_title, meta_desc, desc,
                    seo_slug, proj_type, domain, difficulty, subject,
                    tags, tech_stack, features, str(doc.get("year", ""))
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
    log.info(f"DONE -- {uploaded} projects uploaded!")
    log.info("=" * 50)

if __name__ == "__main__":
    run_autopilot(max_uploads=50, delay_seconds=8)
