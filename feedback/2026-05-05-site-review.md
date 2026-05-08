# towhid.space — Site Review #1
**Date:** 2026-05-05
**Source:** Automated daily cron review

## Overall Assessment
Great foundation — clean design, fast load (~500ms), good use of semantic elements (`nav`, `main`, `footer`), preconnect hints for fonts, and proper viewport/lang attributes.

---

## Findings (5 Actionable Improvements)

### 1. 🚨 Fix 3 broken links immediately
The "View Project" links for **HishabX** and **UTF Mall**, plus "download my resume 📄" in the Story section, all point to `href="#"`. These dead-end links hurt UX and SEO. Link to live app stores, GitHub repos, or a hosted PDF respectively. Remove them entirely if destinations don't exist yet.

### 2. 🔍 Add SEO meta tags & structured data — currently missing entirely
The site has **zero** OG tags, no `meta description`, no `twitter:card` tags, no `canonical` URL, no JSON-LD schema, and no `favicon`. This means link previews on LinkedIn/Twitter/Slack will be blank or ugly. Add at minimum:
- `<meta name="description" content="...">`
- `og:title`, `og:description`, `og:image`, `og:url`
- `twitter:card` + `twitter:image`
- `<link rel="canonical">`
- A Person JSON-LD schema with name, job title, and social profiles
- A favicon

### 3. 🏗️ Fix heading hierarchy — 3 H1 tags on one page
Each section (Intro, Story, Work) uses its own `<h1>`, but they all render in the same HTML document via SPA navigation. Screen readers and SEO crawlers see all three simultaneously. Use a single `<h1>` for the site (e.g., "Towhid — Software Engineer") and downgrade section headings to `<h2>`.

### 4. 📬 Add a direct contact method
No email address, contact form, or Calendly link anywhere — only social profile links. Many recruiters and clients won't chase through LinkedIn. Add a visible email (even as a clickable `mailto:`) or a simple contact form. The "Available for hire" badge at the top is a great hook — pair it with a one-click way to reach you.

### 5. 📈 Add testimonials & a skills/tech-stack section
Experience is strong (10+ years, major companies), but the site lacks social proof. Add 2–3 short testimonials from colleagues or managers. Also consider a dedicated skills/tech-stack visual. A blog section would significantly boost SEO crawl depth over time.

---

## Performance Notes
- Page size: ~34KB
- DOM interactive: ~490ms
- Animation toggle and dark mode: working
- Performance is solid overall

---

## Priority Order
1. **P0 — Fix broken links** (quick win, hurts credibility)
2. **P0 — Add SEO meta tags** (quick win, huge impact on sharing/SEO)
3. **P1 — Add favicon**
4. **P1 — Fix heading hierarchy**
5. **P1 — Add contact method**
6. **P2 — Testimonials & skills section**
7. **P2 — Blog section**
