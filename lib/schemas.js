// lib/schemas.js — All schema builder functions
// Import buildGraph + whatever you need in each page.

import { SITE, FOUNDER, SYED_SOLAR } from "./siteConfig";

/* ── Helper ── */
export function buildGraph(...schemas) {
  return {
    "@context": "https://schema.org",
    "@graph":   schemas.flat().filter(Boolean),
  };
}

/* ══════════════════════════════════════════════════════════════
   1. PERSON — Engineer Muhammad Zubair Afridi
   Wikipedia-level. Critical for Knowledge Panel.
   Place in layout.jsx so it appears on EVERY page.
══════════════════════════════════════════════════════════════ */
export function buildFounderSchema() {
  return {
    "@type": "Person",
    "@id":   `${SITE.url}/#founder`,

    // ── Identity
    name:            FOUNDER.fullName,
    givenName:       FOUNDER.givenName,
    familyName:      FOUNDER.familyName,
    honorificPrefix: FOUNDER.honorific,
    alternateName:   FOUNDER.alternateName,
    description:     FOUNDER.description,
    image: {
      "@type":     "ImageObject",
      url:         FOUNDER.image,
      description: "Engineer Muhammad Zubair Afridi — Founder & CEO of AIDLA",
    },
    nationality: { "@type": "Country", name: "Pakistan" },
    gender:      "Male",
    birthDate:   FOUNDER.dob,
    birthPlace: {
      "@type":         "Place",
      name:            "Peshawar",
      address: {
        "@type":         "PostalAddress",
        addressLocality: "Peshawar",
        addressRegion:   "Khyber Pakhtunkhwa",
        addressCountry:  "PK",
      },
    },
    address: {
      "@type":         "PostalAddress",
      streetAddress:   FOUNDER.address.street,
      addressLocality: FOUNDER.address.locality,
      addressRegion:   FOUNDER.address.region,
      postalCode:      FOUNDER.address.postalCode,
      addressCountry:  FOUNDER.address.country,
    },

    // ── Contact
    telephone: FOUNDER.phone,
    email:     FOUNDER.email,
    url:       FOUNDER.socials.googleSite,

    // ── Job & organisations
    jobTitle: FOUNDER.jobTitle,
    worksFor: [
      { "@id": `${SITE.url}/#organization` },
      { "@id": `${SITE.url}/#syed-solar` },
    ],
    affiliation: [
      { "@id": `${SITE.url}/#organization` },
      { "@id": `${SITE.url}/#syed-solar` },
      {
        "@type": "Organization",
        name:    "Pakistan Engineering Council (PEC)",
        url:     "https://www.pec.org.pk/",
      },
      {
        "@type": "CollegeOrUniversity",
        name:    "Sarhad University of Science and Information Technology (SUIT)",
        url:     "https://suit.edu.pk/",
        address: {
          "@type":         "PostalAddress",
          addressLocality: "Peshawar",
          addressRegion:   "Khyber Pakhtunkhwa",
          addressCountry:  "PK",
        },
      },
    ],

    // ── Credentials & skills
    hasCredential: [
      {
        "@type":         "EducationalOccupationalCredential",
        name:            "BSc Electrical Engineering — Gold Medal, Batch Topper",
        credentialCategory: "degree",
        recognizedBy: {
          "@type": "CollegeOrUniversity",
          name:    "Sarhad University of Science and Information Technology (SUIT)",
        },
        dateCreated: "2024-01-01",
        description: `Graduated with CGPA ${FOUNDER.cgpa}/4.0. Awarded Gold Medal as Batch Topper 2020–2024 by the Governor of Khyber Pakhtunkhwa on 19 June 2025.`,
      },
      {
        "@type":         "EducationalOccupationalCredential",
        name:            "PEC Registered Electrical Engineer — ELECT/109809",
        credentialCategory:"license",
        recognizedBy: {
          "@type": "GovernmentOrganization",
          name:    "Pakistan Engineering Council (PEC)",
          url:     "https://www.pec.org.pk/",
        },
        identifier: FOUNDER.pecReg,
        description: "Registered professional Electrical Engineer with Pakistan Engineering Council.",
      },
    ],
    knowsAbout: [
      "Electrical Engineering",
      "Power Systems",
      "Solar Energy",
      "Artificial Intelligence",
      "EdTech",
      "Entrepreneurship",
      "Embedded Systems",
      "Robotics",
      "Web Development",
      "AI Learning Platforms",
    ],

    // ── Education
    alumniOf: FOUNDER.education.map((e) => ({
      "@type":      "EducationalOrganization",
      name:         e.institution,
      description:  e.type,
      ...(e.gpa && { description: `${e.type} — CGPA ${e.gpa}. ${e.distinction}` }),
    })),

    // ── FYP / Research
    author: {
      "@type": "Thesis",
      name:    FOUNDER.fyp.title,
      url:     FOUNDER.fyp.thesisUrl,
      description: FOUNDER.fyp.description,
      inLanguage: "en",
      publisher: {
        "@type": "CollegeOrUniversity",
        name:    "Sarhad University of Science and Information Technology (SUIT)",
      },
      funder: {
        "@type": "GovernmentOrganization",
        name:    FOUNDER.fyp.funder,
      },
      datePublished: "2024-01-01",
    },

    // ── Awards
    award: FOUNDER.awards.map((a) => a.name),

    // ── Notable works / media
    mainEntityOfPage: FOUNDER.socials.googleSite,

    // ── All sameAs — critical for Knowledge Panel entity disambiguation
    sameAs: [
      FOUNDER.socials.linkedin,
      FOUNDER.socials.facebook,
      FOUNDER.socials.instagram,
      FOUNDER.socials.tiktok,
      FOUNDER.socials.youtube,
      FOUNDER.socials.googleSite,
      FOUNDER.socials.suitTV,
      "https://www.pec.org.pk/",
      // Award reference URLs strengthen entity signals
      ...FOUNDER.awards.flatMap((a) => a.refs || []),
    ],
  };
}

/* ══════════════════════════════════════════════════════════════
   2. ORGANIZATION — AIDLA
   Multi-type: Org + EducationalOrg + LocalBusiness + OnlineBusiness
══════════════════════════════════════════════════════════════ */
export function buildOrganizationSchema() {
  return {
    "@type": [
      "Organization",
      "EducationalOrganization",
      "LocalBusiness",
      "OnlineBusiness",
    ],
    "@id":       `${SITE.url}/#organization`,
    name:        SITE.name,
    legalName:   SITE.legalName,
    alternateName: [
      "Artificial Intelligence Digital Learning Academy",
      "AIDLA Online",
      "AIDLA Pakistan",
      "Pakistan #1 AI Powered Learning Platform",
    ],
    url:         SITE.url,
    description: SITE.description,
    slogan:      SITE.tagline,
    foundingDate:SITE.foundingDate,
    logo: {
      "@type":     "ImageObject",
      "@id":       `${SITE.url}/#logo`,
      url:         SITE.logo,
      contentUrl:  SITE.logo,
      width:       200,
      height:      60,
    },
    image:     SITE.ogImage,
    telephone: SITE.phone,
    email:     SITE.email,
    address: {
      "@type":         "PostalAddress",
      streetAddress:   SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion:   SITE.address.region,
      postalCode:      SITE.address.postalCode,
      addressCountry:  SITE.address.country,
    },
    geo: {
      "@type":   "GeoCoordinates",
      latitude:  SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    hasMap:   "https://maps.google.com/?q=Peshawar,+Khyber+Pakhtunkhwa,+Pakistan",
    areaServed: [
      { "@type": "Country",            name: "Pakistan", "@id": "https://www.wikidata.org/wiki/Q843" },
      { "@type": "City",               name: "Peshawar" },
      { "@type": "AdministrativeArea", name: "Khyber Pakhtunkhwa" },
    ],
    contactPoint: {
      "@type":           "ContactPoint",
      telephone:         SITE.phone,
      email:             SITE.email,
      contactType:       "customer support",
      areaServed:        "PK",
      availableLanguage: ["English", "Urdu"],
      url:               `${SITE.url}/contact`,
    },
    founder:  { "@id": `${SITE.url}/#founder` },
    employee: { "@id": `${SITE.url}/#founder` },
    knowsAbout: [
      "AI Learning", "Online Education", "Pakistan Education",
      "Daily Quizzes", "Career Tools", "CV Builder",
      "Rewards Based Learning", "EdTech", "KPK Education",
    ],
    sameAs: Object.values(SITE.socials),
  };
}

/* ══════════════════════════════════════════════════════════════
   3. LOCAL BUSINESS — Syed Solar Energy
══════════════════════════════════════════════════════════════ */
export function buildSyedSolarSchema() {
  return {
    "@type": ["LocalBusiness", "Organization"],
    "@id":   `${SITE.url}/#syed-solar`,
    name:    SYED_SOLAR.name,
    url:     SYED_SOLAR.url,
    description: SYED_SOLAR.description,
    foundingDate: SYED_SOLAR.foundingDate,
    telephone:   SYED_SOLAR.phone,
    address: {
      "@type":         "PostalAddress",
      streetAddress:   SYED_SOLAR.address.street,
      addressLocality: SYED_SOLAR.address.locality,
      addressRegion:   SYED_SOLAR.address.region,
      postalCode:      SYED_SOLAR.address.postalCode,
      addressCountry:  SYED_SOLAR.address.country,
    },
    geo: {
      "@type":   "GeoCoordinates",
      latitude:  SYED_SOLAR.geo.latitude,
      longitude: SYED_SOLAR.geo.longitude,
    },
    hasMap: SYED_SOLAR.mapsUrl,
    employee: {
      "@id": `${SITE.url}/#founder`,
    },
    knowsAbout: [
      "Solar Energy", "Solar Panel Installation",
      "Renewable Energy", "Power Systems", "Peshawar Solar",
    ],
  };
}

/* ══════════════════════════════════════════════════════════════
   4. WEBSITE — enables Sitelinks Search Box
══════════════════════════════════════════════════════════════ */
export function buildWebSiteSchema() {
  return {
    "@type":      "WebSite",
    "@id":        `${SITE.url}/#website`,
    url:          SITE.url,
    name:         SITE.name,
    alternateName:"AIDLA Online",
    description:  SITE.description,
    publisher:    { "@id": `${SITE.url}/#organization` },
    inLanguage:   SITE.language,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type":     "EntryPoint",
        urlTemplate:`${SITE.url}/faqs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* ══════════════════════════════════════════════════════════════
   5. SOFTWARE APPLICATION — AIDLA as web app
══════════════════════════════════════════════════════════════ */
export function buildSoftwareSchema() {
  return {
    "@type":             "SoftwareApplication",
    "@id":               `${SITE.url}/#app`,
    name:                SITE.name,
    url:                 SITE.url,
    description:         SITE.description,
    applicationCategory: "EducationalApplication",
    operatingSystem:     "Web",
    offers: {
      "@type":        "Offer",
      price:          "0",
      priceCurrency:  "PKR",
      availability:   "https://schema.org/InStock",
    },
    author:    { "@id": `${SITE.url}/#organization` },
    publisher: { "@id": `${SITE.url}/#organization` },
    inLanguage: SITE.language,
  };
}

/* ══════════════════════════════════════════════════════════════
   6. EDUCATIONAL ORGANIZATION — with OfferCatalog
══════════════════════════════════════════════════════════════ */
export function buildEducationalOrgSchema() {
  return {
    "@type":   "EducationalOrganization",
    "@id":     `${SITE.url}/#edu-org`,
    name:      SITE.legalName,
    url:       SITE.url,
    telephone: SITE.phone,
    email:     SITE.email,
    address: {
      "@type":         "PostalAddress",
      streetAddress:   SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion:   SITE.address.region,
      postalCode:      SITE.address.postalCode,
      addressCountry:  SITE.address.country,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name:    "Free AI Learning Courses and Tools",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type":     "Course",
            name:        "Free Online Quizzes",
            description: "Daily quiz competitions for Pakistani learners with AIDLA Coins rewards.",
            provider:    { "@id": `${SITE.url}/#organization` },
          },
          price: "0", priceCurrency: "PKR",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type":     "Course",
            name:        "AI Career Tools",
            description: "CV builder, cover letter generator, interview prep, email writer, summarizer, and more.",
            provider:    { "@id": `${SITE.url}/#organization` },
          },
          price: "0", priceCurrency: "PKR",
          availability: "https://schema.org/InStock",
        },
      ],
    },
  };
}

/* ══════════════════════════════════════════════════════════════
   7. WEBPAGE — per page, pass page-specific data
══════════════════════════════════════════════════════════════ */
export function buildWebPageSchema({
  path = "/",
  name,
  description,
  dateModified,
  speakableSelectors = [],
} = {}) {
  const pageUrl = `${SITE.url}${path}`;
  return {
    "@type":      "WebPage",
    "@id":        `${pageUrl}#webpage`,
    url:          pageUrl,
    name:         name        ?? SITE.name,
    description:  description ?? SITE.description,
    isPartOf:     { "@id": `${SITE.url}/#website` },
    about:        { "@id": `${SITE.url}/#organization` },
    primaryImageOfPage: SITE.ogImage,
    inLanguage:   "en",
    dateModified: dateModified ?? new Date().toISOString().split("T")[0],
    breadcrumb:   { "@id": `${pageUrl}#breadcrumb` },
    mainContentOfPage: { "@type": "WebPageElement", cssSelector: "#main-content" },
    ...(speakableSelectors.length > 0 && {
      speakable: {
        "@type":     "SpeakableSpecification",
        cssSelector: speakableSelectors,
      },
    }),
  };
}

/* ══════════════════════════════════════════════════════════════
   8. BREADCRUMB — per page
══════════════════════════════════════════════════════════════ */
export function buildBreadcrumbSchema(items = [], path = "/") {
  return {
    "@type": "BreadcrumbList",
    "@id":   `${SITE.url}${path}#breadcrumb`,
    itemListElement: items.map(({ name, url }, i) => ({
      "@type":   "ListItem",
      position:  i + 1,
      name,
      item:      `${SITE.url}${url}`,
    })),
  };
}

/* ══════════════════════════════════════════════════════════════
   9. FAQ PAGE
══════════════════════════════════════════════════════════════ */
export function buildFAQSchema(faqs = []) {
  return {
    "@type": "FAQPage",
    "@id":   `${SITE.url}/#faqpage`,
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name:    question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/* ══════════════════════════════════════════════════════════════
   10. HOW-TO
══════════════════════════════════════════════════════════════ */
export function buildHowToSchema(steps = []) {
  return {
    "@type":      "HowTo",
    "@id":        `${SITE.url}/#howto`,
    name:         "How AIDLA Works",
    description:  "Learn how to study, earn AIDLA Coins, and redeem rewards on Pakistan's #1 AI learning platform.",
    step: steps.map(({ title, text }, i) => ({
      "@type":   "HowToStep",
      position:  i + 1,
      name:      title,
      text:      text,
    })),
  };
}

/* ══════════════════════════════════════════════════════════════
   11. ITEM LIST — winners, sections, rankings
══════════════════════════════════════════════════════════════ */
export function buildItemListSchema({ id, name, items = [] }) {
  return {
    "@type": "ItemList",
    "@id":   `${SITE.url}/#${id}`,
    name,
    itemListElement: items.map(({ name, url }, i) => ({
      "@type":   "ListItem",
      position:  i + 1,
      name,
      url: url?.startsWith("http") ? url : `${SITE.url}${url}`,
    })),
  };
}

/* ══════════════════════════════════════════════════════════════
   12. ARTICLE — blogs and news pages
══════════════════════════════════════════════════════════════ */
export function buildArticleSchema({
  slug, type = "BlogPosting",
  title, description, image,
  datePublished, dateModified,
} = {}) {
  return {
    "@type":       type,
    "@id":         `${SITE.url}/blogs/${slug}#article`,
    headline:      title,
    description,
    image:         image ?? SITE.ogImage,
    datePublished,
    dateModified:  dateModified ?? datePublished,
    author:        { "@id": `${SITE.url}/#founder` },
    publisher:     { "@id": `${SITE.url}/#organization` },
    mainEntityOfPage: `${SITE.url}/blogs/${slug}`,
    inLanguage:    "en",
  };
}