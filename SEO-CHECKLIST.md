# SEO Checklist — Marlboro Appliance Repair Pros
## Local SEO Optimization for Lead Generation

---

## ✅ Technical SEO

### Per-Page Basics
- [ ] Unique `<title>` tag on every page (50–60 chars) with keyword + location
- [ ] Unique `<meta name="description">` on every page (150–160 chars)
- [ ] One `<h1>` per page containing primary keyword + "Marlboro NJ"
- [ ] `<link rel="canonical">` on every page
- [ ] `lang="en"` on `<html>` tag
- [ ] `<meta name="viewport">` for mobile

### Crawlability
- [ ] `robots.txt` present at `/robots.txt` — ✅ Done
- [ ] `sitemap.xml` present at `/sitemap.xml` — ✅ Done
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] No broken internal links (run a link checker)
- [ ] All pages return HTTP 200 (not 301 chains)

### Performance (Core Web Vitals)
- [ ] Images use `data-src` lazy loading — ✅ Done in JS
- [ ] All images have descriptive `alt` tags with keywords
- [ ] CSS loaded in `<head>`, JS loaded with `defer` — ✅ Done
- [ ] Google Fonts loaded with `preconnect` hints — ✅ Done
- [ ] Target LCP < 2.5s (test with PageSpeed Insights)
- [ ] Target CLS < 0.1 (no layout shifts)
- [ ] Enable gzip/brotli compression on server (nginx config handles this) — ✅ Done
- [ ] Set proper cache headers for static assets — ✅ Done in server.js

### Security (affects ranking)
- [ ] HTTPS enabled (Let's Encrypt via deploy.sh) 
- [ ] HSTS headers set — ✅ Done in server.js (helmet)
- [ ] No mixed content (HTTP resources on HTTPS page)

---

## ✅ On-Page SEO

### Keyword Targeting (per page)
| Page | Primary Keyword | Secondary Keywords |
|------|----------------|-------------------|
| index.html | appliance repair Marlboro NJ | appliance repair near me, Marlboro NJ appliance repair |
| refrigerator-repair.html | refrigerator repair Marlboro NJ | fridge repair Marlboro NJ, refrigerator repair near me |
| washer-repair.html | washer repair Marlboro NJ | washing machine repair Marlboro NJ |
| dryer-repair.html | dryer repair Marlboro NJ | dryer repair near me Marlboro |
| oven-stove-repair.html | oven stove repair Marlboro NJ | oven repair Marlboro NJ, stove repair NJ |
| dishwasher-repair.html | dishwasher repair Marlboro NJ | dishwasher repair near me |
| dryer-not-heating.html | dryer not heating Marlboro NJ | dryer not heating up, dryer runs but no heat |
| refrigerator-leaking.html | refrigerator leaking water Marlboro NJ | fridge leaking, refrigerator water leak NJ |
| washer-not-spinning.html | washer not spinning Marlboro NJ | washing machine won't spin, washer spin cycle broken |
| about-service-area.html | appliance repair service area Marlboro NJ | Monmouth County appliance repair |

### Content Depth
- [ ] Each main service page: 600+ words of unique content
- [ ] Each problem-specific page: 800+ words with detailed cause/solution info
- [ ] FAQ section on every page (minimum 5 questions)
- [ ] Internal links on every page → related service pages
- [ ] Local references in content: Marlboro Township, Monmouth County, specific towns

### Schema Markup — ✅ Done on all pages
- [ ] `LocalBusiness` schema with full address, phone, hours
- [ ] `areaServed` array with all covered towns
- [ ] `hasOfferCatalog` with specific service offers on service pages
- [ ] Validate at: https://validator.schema.org/
- [ ] Test in Google's Rich Results Test: https://search.google.com/test/rich-results

---

## ✅ Local SEO

### Google Business Profile (CRITICAL — do this first)
- [ ] Claim/create Google Business Profile at business.google.com
- [ ] Category: "Appliance Repair Service"
- [ ] Add ALL services (refrigerator, washer, dryer, oven, dishwasher, etc.)
- [ ] Verify business address or service area (Marlboro, NJ)
- [ ] Add business hours: Mon–Sun 7am–8pm
- [ ] Upload 10+ real photos (technicians, tools, completed repairs)
- [ ] Add phone: (732) 555-0100
- [ ] Add website URL
- [ ] Write complete business description (750 chars max)
- [ ] Enable messaging
- [ ] Set up booking button linking to website form

### NAP Consistency (Name, Address, Phone)
Ensure these are IDENTICAL everywhere online:
```
Marlboro Appliance Repair Pros
Marlboro, NJ 07746
(732) 555-0100
```
- [ ] Website footer — ✅ Done
- [ ] Google Business Profile
- [ ] Yelp listing
- [ ] Bing Places
- [ ] Apple Maps
- [ ] Facebook Business Page
- [ ] Nextdoor Business
- [ ] HomeAdvisor / Angi
- [ ] Thumbtack

### Citation Building (Local Directories)
Build citations on these platforms (register with marlboroappliancerepairpros@gmail.com):
- [ ] Yelp: https://biz.yelp.com
- [ ] Bing Places: https://www.bingplaces.com
- [ ] Apple Maps: https://mapsconnect.apple.com
- [ ] Facebook Business: https://business.facebook.com
- [ ] Nextdoor: https://business.nextdoor.com
- [ ] HomeAdvisor/Angi: https://pro.homeadvisor.com
- [ ] Thumbtack: https://www.thumbtack.com/pro
- [ ] Houzz: https://www.houzz.com/pro
- [ ] BBB: https://www.bbb.org
- [ ] Chamber of Commerce: Marlboro Township Chamber
- [ ] YellowPages: https://www.yellowpages.com
- [ ] Foursquare: https://business.foursquare.com
- [ ] Manta: https://www.manta.com
- [ ] Superpages: https://www.superpages.com
- [ ] Citysearch
- [ ] Local.com
- [ ] EZlocal

### Review Strategy
- [ ] Ask every satisfied customer for a Google review
- [ ] Create a short link to Google review page (bit.ly or Google shortlink)
- [ ] Respond to all reviews (positive and negative) within 24 hours
- [ ] Goal: 50+ Google reviews, 4.7+ average rating
- [ ] Add reviews to Yelp, Facebook, HomeAdvisor

### Local Link Building
- [ ] Marlboro Township official website — get listed
- [ ] Monmouth County business directory
- [ ] NJ appliance repair association listings
- [ ] Local NJ home improvement blogs — offer to write guest posts
- [ ] Nextdoor posts when neighbors ask for appliance repair recommendations
- [ ] Sponsor a local Marlboro event for a backlink

---

## ✅ Conversion Optimization

### Above the Fold
- [ ] Phone number visible without scrolling — ✅ Done (header + top banner)
- [ ] Clear value proposition in H1 — ✅ Done
- [ ] CTA button ("Call Now" or "Book Service") — ✅ Done
- [ ] Trust signals visible (licensed, insured, same-day) — ✅ Done (hero + trust bar)

### Lead Form
- [ ] Form on every page — ✅ Done
- [ ] 5 required fields: name, phone, appliance, issue, zip — ✅ Done
- [ ] Consent checkbox — ✅ Done
- [ ] Form submits to /api/submit-lead — ✅ Done
- [ ] Webhook configured in .env — configure WEBHOOK_URL
- [ ] Success message after submission — ✅ Done
- [ ] Form visible without scrolling on mobile (hero form) — ✅ Done
- [ ] Mobile sticky CTA bar (call + book) — ✅ Done

### Trust Signals
- [ ] "Same-Day Service" prominently displayed — ✅ Done
- [ ] "Licensed & Insured" — ✅ Done
- [ ] "No Hidden Fees" — ✅ Done
- [ ] "90-Day Labor Guarantee" — ✅ Done
- [ ] Customer testimonials — ✅ Done (per page)
- [ ] Review count / star ratings — ✅ Done (trust bar)

---

## ✅ Content Marketing & External Links

### Articles to Post for Backlinks
Write and publish these on free platforms:
1. **Medium**: "5 Signs Your Refrigerator Needs Repair (Before It Fails Completely)"
   - Link: marlboroappliancerepairpros.com/refrigerator-repair.html
2. **LinkedIn**: "How to Know When to Repair vs Replace Your Home Appliances"
   - Link: marlboroappliancerepairpros.com
3. **Google Posts** (via GBP): Weekly posts about each service
4. **Nextdoor**: When neighbors ask for appliance repair recs, mention the business
5. **Facebook Local Groups**: "Marlboro NJ Neighbors" group — post helpful tips + soft pitch
6. **Reddit r/appliancerepair**: Answer questions, mention local service
7. **Quora**: Answer appliance repair questions, link to relevant pages
8. **HomeAdvisor Articles**: Publish tips content

### Platforms to Register On (use marlboroappliancerepairpros@gmail.com)
| Platform | URL | Notes |
|----------|-----|-------|
| Google Business Profile | business.google.com | Top priority |
| Yelp for Business | biz.yelp.com | High local traffic |
| Facebook Business | business.facebook.com | Create page, join local groups |
| Nextdoor Business | business.nextdoor.com | Hyper-local, high intent |
| HomeAdvisor/Angi | pro.homeadvisor.com | Lead gen platform |
| Thumbtack | thumbtack.com/pro | Lead gen platform |
| Houzz | houzz.com/pro | Home services audience |
| LinkedIn Company | linkedin.com/company | Professional citations |
| Medium | medium.com | Article backlinks |

---

## ✅ Analytics & Monitoring

- [ ] Set up Google Analytics 4 — add GA4_MEASUREMENT_ID to .env
- [ ] Set up Google Search Console and verify site
- [ ] Set up Bing Webmaster Tools
- [ ] Monitor: clicks, impressions, avg. position for target keywords
- [ ] Set up a call tracking number (e.g., CallRail) to measure phone leads
- [ ] Track form submissions as GA4 events — ✅ Done in main.js

### Key Metrics to Watch
- Organic traffic from Google
- Keyword rankings for "appliance repair Marlboro NJ" and variants
- Lead form conversion rate (goal: 3–8%)
- Phone call conversion
- Bounce rate (goal: < 60%)
- Time on page (goal: > 90 seconds)

---

## Post-Launch Checklist
- [ ] Submit sitemap to Google Search Console
- [ ] Request indexing for all 10 pages in GSC
- [ ] Run Google PageSpeed Insights on homepage — fix any LCP/CLS issues
- [ ] Test all forms end-to-end (submit a test lead, verify webhook)
- [ ] Test on mobile (iPhone Safari + Android Chrome)
- [ ] Test all phone `tel:` links work on mobile
- [ ] Verify Schema.org markup with Rich Results Test
- [ ] Check all images load correctly
- [ ] Test 404 page works
