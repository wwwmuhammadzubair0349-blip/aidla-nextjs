// app/projects/domain/[domain]/page.jsx
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  buildGraph,
  buildItemListSchema,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/schemas";
import './projdomain.css';

export const revalidate = 3600;

const SITE_URL = "https://www.aidla.online";

const DOMAIN_META = {
  engineering:   { label: "Engineering",            icon: "⚙️", desc: "Free engineering project ideas for FYP, mini projects, and semester projects covering electrical, mechanical, civil, software, and chemical engineering fields." },
  medical:       { label: "Medical & Healthcare",   icon: "🩺", desc: "Medical and biomedical project ideas for FYP and semester projects in healthcare technology, telemedicine, patient monitoring, and health informatics." },
  education:     { label: "Education & EdTech",     icon: "📚", desc: "Education technology project ideas including e-learning platforms, AI tutoring apps, student management systems, and digital classroom tools." },
  business:      { label: "Business & Finance",     icon: "📈", desc: "Business project ideas covering startup tools, e-commerce platforms, inventory management systems, fintech apps, and business analytics dashboards." },
  school:        { label: "School Projects",        icon: "🏫", desc: "School-level project ideas in science, mathematics, and information technology suitable for class 9–12 and O/A level students." },
  web:           { label: "Web & IT Projects",      icon: "🌐", desc: "Full-stack web development project ideas including SaaS platforms, portfolio websites, REST APIs, CMS systems, and real-time web applications." },
  mobile:        { label: "Mobile App Projects",    icon: "📱", desc: "Mobile app project ideas for Android, iOS, React Native, and Flutter development covering productivity, health, finance, and social networking apps." },
  ai_ml:         { label: "AI & Machine Learning",  icon: "🤖", desc: "Artificial intelligence and machine learning project ideas including NLP models, computer vision systems, recommendation engines, and predictive analytics." },
  iot:           { label: "IoT Projects",           icon: "📡", desc: "Internet of Things project ideas covering smart home automation, industrial IoT, environmental monitoring, sensor networks, and embedded systems." },
  blockchain:    { label: "Blockchain Projects",    icon: "⛓️", desc: "Blockchain and Web3 project ideas including DeFi platforms, NFT marketplaces, smart contract systems, supply chain tracking, and DAO tools." },
  data_science:  { label: "Data Science Projects",  icon: "📊", desc: "Data science and analytics project ideas covering data visualization dashboards, predictive modeling, big data pipelines, and machine learning workflows." },
  cybersecurity: { label: "Cybersecurity Projects", icon: "🔒", desc: "Cybersecurity project ideas including network security tools, ethical hacking frameworks, intrusion detection systems, and data encryption applications." },
  ar_vr:         { label: "AR & VR Projects",       icon: "🥽", desc: "Augmented and virtual reality project ideas for education, professional training, gaming, architecture visualization, and enterprise simulation." },
  other:         { label: "Other Projects",         icon: "📦", desc: "Interdisciplinary and miscellaneous project ideas that cross multiple domains, combine emerging technologies, or explore niche research areas." },
};

const ALL_DOMAINS = Object.keys(DOMAIN_META);

function toDbDomain(slug) { return slug.replace(/-/g, "_"); }
function toUrlSlug(d)     { return d.replace(/_/g, "-"); }

const DIFF_LABELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
const TYPE_LABELS  = { fyp: "FYP", mini_project: "Mini Project", semester: "Semester", research: "Research", internship: "Internship", other: "Other" };
const DIFF_STYLE   = {
  beginner:     { background: "#dcfce7", color: "#15803d" },
  intermediate: { background: "#fef9c3", color: "#b45309" },
  advanced:     { background: "#fee2e2", color: "#dc2626" },
};

export async function generateStaticParams() {
  return ALL_DOMAINS.map(d => ({ domain: toUrlSlug(d) }));
}

export async function generateMetadata({ params }) {
  const { domain } = await params;
  const dbDomain = toDbDomain(domain);
  const meta     = DOMAIN_META[dbDomain];
  if (!meta) return { title: "Project Ideas | AIDLA", robots: { index: false, follow: true } };

  const title = `${meta.label} Project Ideas — FYP, Mini & Semester Projects | AIDLA`;
  const url   = `${SITE_URL}/projects/domain/${domain}`;

  return {
    title,
    description: meta.desc,
    keywords:    `${meta.label.toLowerCase()} project ideas, ${meta.label.toLowerCase()} FYP, ${meta.label.toLowerCase()} semester project, AIDLA projects`,
    alternates:  { canonical: url },
    openGraph: {
      title, description: meta.desc, url, siteName: "AIDLA", type: "website",
      images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: `${meta.label} Project Ideas — AIDLA` }],
    },
    twitter: { card: "summary_large_image", title, description: meta.desc, images: [`${SITE_URL}/og-home.jpg`] },
  };
}

export default async function ProjectDomainPage({ params }) {
  const { domain } = await params;
  const dbDomain = toDbDomain(domain);
  const meta     = DOMAIN_META[dbDomain];
  if (!meta) notFound();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const { data: projects } = await supabase
    .from("project_ideas")
    .select("id,title,slug,description,type,difficulty,tech_stack,subject")
    .eq("domain", dbDomain)
    .eq("approval_status", "approved")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(30);

  const items    = projects || [];
  const urlPath  = `/projects/domain/${domain}`;

  const jsonLd = buildGraph(
    buildWebPageSchema({ path: urlPath, name: `${meta.label} Project Ideas`, description: meta.desc }),
    buildBreadcrumbSchema(
      [{ name: "Home", url: "/" }, { name: "Projects", url: "/projects" }, { name: meta.label, url: urlPath }],
      urlPath,
    ),
    buildItemListSchema({
      id:    `${domain}-projects`,
      name:  `${meta.label} Project Ideas`,
      items: items.map(p => ({ name: p.title, url: `/projects/${p.slug}` })),
    }),
  );

  const siblings = ALL_DOMAINS.filter(d => d !== dbDomain);

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="pd-root">
        <nav aria-label="Breadcrumb" className="pd-breadcrumb">
          <Link href="/">Home</Link> / <Link href="/projects">Projects</Link> / <span>{meta.label}</span>
        </nav>

        <header className="pd-header">
          <div className="pd-icon" aria-hidden="true">{meta.icon}</div>
          <h1>{meta.label} Project Ideas</h1>
          <p>{meta.desc}</p>
          <Link href="/projects" className="pd-back">← All project domains</Link>
        </header>

        {items.length === 0 ? (
          <div className="pd-empty">
            <p>No projects yet in this domain.</p>
            <p>Use our AI Project Idea Generator to get a custom idea instantly.</p>
            <div className="pd-empty-btns">
              <Link href="/projects/generate">Generate with AI →</Link>
              <Link href="/projects" className="pd-ghost">All Projects</Link>
            </div>
          </div>
        ) : (
          <>
            <p className="pd-count">{items.length} project idea{items.length !== 1 ? "s" : ""} available</p>
            <div className="pd-grid">
              {items.map(project => (
                <article key={project.id} className="pd-card">
                  {(project.type || project.difficulty) && (
                    <div className="pd-badges">
                      {project.type && (
                        <span className="pd-badge pd-badge-type">
                          {TYPE_LABELS[project.type] || project.type}
                        </span>
                      )}
                      {project.difficulty && (
                        <span className="pd-badge" style={DIFF_STYLE[project.difficulty] || {}}>
                          {DIFF_LABELS[project.difficulty] || project.difficulty}
                        </span>
                      )}
                    </div>
                  )}
                  <h2 className="pd-card-title">{project.title}</h2>
                  {project.description && (
                    <p className="pd-card-desc">
                      {project.description.length > 140
                        ? project.description.slice(0, 140) + "…"
                        : project.description}
                    </p>
                  )}
                  {project.tech_stack?.length > 0 && (
                    <div className="pd-tech">
                      {project.tech_stack.slice(0, 4).map(t => (
                        <span key={t} className="pd-tech-tag">{t}</span>
                      ))}
                    </div>
                  )}
                  <Link href={`/projects/${project.slug}`} className="pd-card-link">View details →</Link>
                </article>
              ))}
            </div>

            <div className="pd-cta">
              <p className="pd-cta-title">Can&apos;t find exactly what you need?</p>
              <p className="pd-cta-sub">Use our AI Project Idea Generator to get a custom {meta.label.toLowerCase()} project idea in seconds.</p>
              <div className="pd-cta-btns">
                <Link href="/projects/generate">Generate with AI →</Link>
                <Link href="/projects" className="pd-ghost">All Projects</Link>
              </div>
            </div>
          </>
        )}

        <section className="pd-siblings" aria-label="Other project domains">
          <h2>More Project Domains</h2>
          <div className="pd-tags">
            {siblings.map(d => (
              <Link key={d} href={`/projects/domain/${toUrlSlug(d)}`} className="pd-tag">
                <span aria-hidden="true">{DOMAIN_META[d].icon}</span>
                {DOMAIN_META[d].label}
              </Link>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
