# Architecture — Marlboro Appliance Repair Pros

## System Overview

```
                         Internet
                            │
                    ┌───────▼────────┐
                    │   Cloudflare   │  (CDN + DDoS protection)
                    │   (optional)   │
                    └───────┬────────┘
                            │ HTTPS
                    ┌───────▼────────┐
                    │     Nginx      │  Port 80/443
                    │  Reverse Proxy │  → Terminates SSL
                    │                │  → Gzip compression
                    │                │  → Rate limiting (API)
                    └───────┬────────┘
                            │ HTTP (internal)
                    ┌───────▼────────┐
                    │  Node.js /     │  Port 3005 (auto-increments)
                    │  Express App   │  → Serves static HTML/CSS/JS
                    │  (PM2 managed) │  → Handles lead form API
                    └───────┬────────┘
                            │
               ┌────────────┼────────────┐
               │                         │
      ┌────────▼──────┐       ┌──────────▼──────┐
      │  Static Files │       │  /api/submit-lead│
      │  /public/*.html        │  POST endpoint   │
      │  /css/style.css        │                  │
      │  /js/main.js   │       │  - Validates input│
      │  /images/      │       │  - Forwards to   │
      │  sitemap.xml   │       │    webhooks       │
      │  robots.txt    │       └──────────┬────────┘
      └───────────────┘                   │
                                          │ HTTPS POST
                               ┌──────────▼──────────────────────┐
                               │   Webhook Destinations           │
                               │                                  │
                               │  ┌──────────┐  ┌─────────────┐  │
                               │  │  Zapier  │  │    Make     │  │
                               │  │ (primary)│  │ (secondary) │  │
                               │  └────┬─────┘  └──────┬──────┘  │
                               │       │                │         │
                               │  ┌────▼───────────────▼──────┐  │
                               │  │   GHL / CRM / Email / SMS │  │
                               │  └──────────────────────────┘  │
                               └─────────────────────────────────┘
```

---

## File Structure

```
site/
├── .env.example          # Environment variable template
├── .env                  # Production config (NEVER commit)
├── .gitignore
├── package.json
├── server.js             # Express server (entry point)
├── deploy.sh             # One-command deployment script
│
├── public/               # Static web root (served by Express)
│   ├── index.html                  # Homepage
│   ├── refrigerator-repair.html   # Service page
│   ├── washer-repair.html         # Service page
│   ├── dryer-repair.html          # Service page
│   ├── oven-stove-repair.html     # Service page
│   ├── dishwasher-repair.html     # Service page
│   ├── dryer-not-heating.html     # Problem-specific page
│   ├── refrigerator-leaking.html  # Problem-specific page
│   ├── washer-not-spinning.html   # Problem-specific page
│   ├── about-service-area.html    # About + Service Area
│   ├── 404.html                   # Custom 404 page
│   ├── robots.txt                 # SEO crawl directives
│   ├── sitemap.xml                # SEO sitemap
│   ├── css/
│   │   └── style.css              # All styles (mobile-first)
│   ├── js/
│   │   └── main.js                # Nav toggle, forms, lazy load
│   └── images/                    # (place optimized images here)
│
├── SEO-CHECKLIST.md      # Full local SEO action list
├── DEPLOYMENT.md         # Deployment guide
└── ARCHITECTURE.md       # This file
```

---

## Data Flow: Lead Submission

```
User fills form
      │
      ▼
main.js validates client-side
(name, phone, zip format, required fields, consent)
      │
      ▼ AJAX POST /api/submit-lead
      │
Express server validates server-side
(same rules + length limits + type checks)
      │
      ├── FAIL → 400 JSON {success:false, errors:[...]}
      │
      └── PASS → Build lead object:
                  {name, phone, appliance, issue, zip,
                   page, consent, timestamp, source, business}
                        │
                        ├─► POST to WEBHOOK_URL (primary)
                        │   Header: X-Webhook-Secret
                        │   Timeout: 8 seconds
                        │
                        └─► POST to WEBHOOK_URL_SECONDARY (if set)
                                │
                                ▼
                        200 JSON {success:true, message:"..."}
                                │
                                ▼
                        main.js shows success state
                        GA4 event fired: lead_form_submit
```

---

## Security Architecture

| Layer | Implementation |
|-------|---------------|
| Transport | HTTPS via Let's Encrypt (nginx) |
| Headers | Helmet.js: CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| Rate Limiting | express-rate-limit: 10 form subs/IP/15min, 120 req/IP/min global |
| Input Validation | Server: name length, phone regex, zip regex, consent bool, textarea max 500 chars |
| CORS | Restricted to SITE_URL origin only |
| Webhook Auth | X-Webhook-Secret header (shared secret in .env) |
| No Database | No SQL injection surface; no PII stored server-side |
| Dependency Security | Production dependencies only (npm ci --omit=dev) |

---

## Performance Architecture

| Optimization | Implementation |
|-------------|----------------|
| Image Lazy Loading | IntersectionObserver in main.js, `data-src` attrs |
| CSS/Font Loading | Fonts via `preconnect`, CSS in `<head>` |
| JS Deferral | `<script defer>` on main.js |
| Static File Caching | 7-day cache on CSS/JS/images (Express + nginx) |
| HTML No-Cache | `no-store` on HTML files for SEO freshness |
| Gzip | nginx gzip on CSS, JS, HTML, JSON |
| Mobile-First CSS | CSS variables, clamp() for fluid typography, grid layout |

---

## SEO Architecture

| Signal | Implementation |
|--------|---------------|
| On-page keywords | Unique H1+meta per page targeting local keyword |
| Schema markup | LocalBusiness JSON-LD on every page |
| Canonical URLs | `<link rel="canonical">` on every page |
| Sitemap | /sitemap.xml with all 10 pages |
| Robots | /robots.txt allowing all crawlers |
| Internal linking | Every page links to all other service pages (footer + content) |
| NAP consistency | Name/Address/Phone identical in footer + schema on all pages |
| Page speed | Lazy images, deferred JS, gzip, CDN-ready |
| Mobile | Mobile-first CSS, sticky CTA bar, tap-to-call links |

---

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Language | Node.js 18+ | Universal, lightweight, fast |
| Framework | Express 4 | Simple, battle-tested, zero overhead |
| Security | Helmet.js | OWASP headers in one line |
| Rate Limiting | express-rate-limit | Prevent form spam |
| Frontend | Vanilla HTML/CSS/JS | No build step, max speed, SEO-perfect |
| CSS | Custom (no framework) | Full control, no unused CSS bloat |
| Icons | Inline SVG | No external requests, customizable |
| Fonts | Google Fonts (preconnect) | Professional typography |
| Process Manager | PM2 | Auto-restart, logging, clustering |
| Reverse Proxy | Nginx | SSL termination, gzip, caching |
| SSL | Let's Encrypt (Certbot) | Free, auto-renewing |
| Deployment | deploy.sh bash script | Single command, idempotent |
