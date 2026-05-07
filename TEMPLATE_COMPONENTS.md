# Shared HTML Components for All Pages
## Business: Marlboro Appliance Repair Pros | Marlboro, NJ 07746
## Phone placeholder: PHONE_NUMBER (replaced via JS from config)

---

## HEAD TEMPLATE
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="[PAGE_DESCRIPTION — 150-160 chars]">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="[PAGE_TITLE]">
  <meta property="og:description" content="[PAGE_DESCRIPTION]">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://marlboroappliancerepairpros.com/[PAGE_SLUG]">
  <title>[PAGE_TITLE] | Marlboro Appliance Repair Pros</title>
  <link rel="canonical" href="https://marlboroappliancerepairpros.com/[PAGE_SLUG]">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <script>window.__PHONE__ = "(732) 555-0100";</script>
  <!-- Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Marlboro Appliance Repair Pros",
    "telephone": "(732) 555-0100",
    "email": "info@marlboroappliancerepairpros.com",
    "url": "https://marlboroappliancerepairpros.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Marlboro",
      "addressRegion": "NJ",
      "postalCode": "07746",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 40.3218,
      "longitude": -74.2568
    },
    "openingHours": ["Mo-Su 07:00-20:00"],
    "priceRange": "$$",
    "areaServed": ["Marlboro", "Morganville", "Englishtown", "Freehold", "Holmdel", "Hazlet", "Aberdeen", "Matawan", "Old Bridge", "Keyport"],
    "serviceType": "[PAGE_SERVICE_TYPE]",
    "description": "[PAGE_DESCRIPTION]",
    "@id": "https://marlboroappliancerepairpros.com/[PAGE_SLUG]"
  }
  </script>
</head>
```

---

## TOP BANNER + HEADER
```html
<div class="top-banner">
  <span>📍 Proudly serving Marlboro, NJ &amp; surrounding areas</span>
  <span class="dot">●</span>
  <span>Same-Day Service Available</span>
  <span class="dot">●</span>
  <a href="tel:7325550100">Call Now: (732) 555-0100</a>
</div>

<header class="site-header">
  <div class="header-inner">
    <a href="/" class="logo" aria-label="Marlboro Appliance Repair Pros Home">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="name">Marlboro Appliance Repair Pros</span>
        <span class="tagline">Serving Marlboro, NJ Since 2009</span>
      </div>
    </a>

    <a href="tel:7325550100" class="header-phone" aria-label="Call us">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
      <div class="header-phone-text">
        <span class="label">Free Estimates</span>
        <span class="number">(732) 555-0100</span>
      </div>
    </a>

    <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>

  <nav class="site-nav" id="siteNav" role="navigation" aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/refrigerator-repair.html">Refrigerator Repair</a>
    <a href="/washer-repair.html">Washer Repair</a>
    <a href="/dryer-repair.html">Dryer Repair</a>
    <a href="/oven-stove-repair.html">Oven &amp; Stove</a>
    <a href="/dishwasher-repair.html">Dishwasher</a>
    <a href="/about-service-area.html">About / Areas</a>
    <a href="#get-quote" class="nav-cta">Book Service</a>
  </nav>
</header>
```

---

## LEAD FORM HTML (reusable)
```html
<div class="lead-form-wrap">
  <form class="lead-form" id="[FORM_ID]" novalidate>
    <div class="form-group">
      <label for="name-[FORM_ID]">Your Name *</label>
      <input type="text" id="name-[FORM_ID]" name="name" placeholder="Jane Smith" required autocomplete="name">
      <span class="form-error-msg">Please enter your full name.</span>
    </div>
    <div class="form-group">
      <label for="phone-[FORM_ID]">Phone Number *</label>
      <input type="tel" id="phone-[FORM_ID]" name="phone" placeholder="(732) 555-0198" required autocomplete="tel">
      <span class="form-error-msg">Please enter a valid phone number.</span>
    </div>
    <div class="form-group">
      <label for="appliance-[FORM_ID]">Appliance *</label>
      <select id="appliance-[FORM_ID]" name="appliance" required>
        <option value="">Select appliance…</option>
        <option value="Refrigerator">Refrigerator</option>
        <option value="Washer">Washer / Washing Machine</option>
        <option value="Dryer">Dryer</option>
        <option value="Oven">Oven / Range</option>
        <option value="Stove">Stove / Cooktop</option>
        <option value="Dishwasher">Dishwasher</option>
        <option value="Microwave">Microwave</option>
        <option value="Freezer">Freezer</option>
        <option value="Other">Other</option>
      </select>
      <span class="form-error-msg">Please select your appliance.</span>
    </div>
    <div class="form-group">
      <label for="issue-[FORM_ID]">Describe the Issue *</label>
      <textarea id="issue-[FORM_ID]" name="issue" placeholder="e.g. My dryer runs but clothes stay cold." rows="3" required></textarea>
      <span class="form-error-msg">Please describe the issue (at least 5 characters).</span>
    </div>
    <div class="form-group">
      <label for="zip-[FORM_ID]">ZIP Code *</label>
      <input type="text" id="zip-[FORM_ID]" name="zip" placeholder="07746" maxlength="10" required autocomplete="postal-code">
      <span class="form-error-msg">Please enter a valid ZIP code.</span>
    </div>
    <div class="form-consent">
      <input type="checkbox" id="consent-[FORM_ID]" name="consent" required>
      <label for="consent-[FORM_ID]">I agree to be contacted by phone or text regarding my appliance repair request. <span class="consent-error form-error-msg">Required.</span></label>
    </div>
    <button type="submit" class="form-submit-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
      Get My Free Estimate
    </button>
    <p class="form-note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      Your info is private and never shared.
    </p>
  </form>
  <div class="form-success">
    <div class="checkmark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="28" height="28" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h3>We Got Your Request!</h3>
    <p>A certified technician will call you within <strong>30 minutes</strong> to confirm your appointment. Check your phone!</p>
  </div>
</div>
```

---

## FOOTER HTML
```html
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="logo" aria-label="Marlboro Appliance Repair Pros Home">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="name">Marlboro Appliance Repair Pros</span>
            <span class="tagline">Marlboro, NJ 07746</span>
          </div>
        </a>
        <p class="footer-desc">Local appliance repair experts serving Marlboro, NJ and Monmouth County. Same-day service, licensed technicians, no hidden fees.</p>
        <a href="tel:7325550100" class="footer-phone">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          (732) 555-0100
        </a>
      </div>

      <div class="footer-col">
        <h4>Our Services</h4>
        <ul>
          <li><a href="/refrigerator-repair.html">Refrigerator Repair</a></li>
          <li><a href="/washer-repair.html">Washer Repair</a></li>
          <li><a href="/dryer-repair.html">Dryer Repair</a></li>
          <li><a href="/oven-stove-repair.html">Oven &amp; Stove Repair</a></li>
          <li><a href="/dishwasher-repair.html">Dishwasher Repair</a></li>
          <li><a href="/dryer-not-heating.html">Dryer Not Heating</a></li>
          <li><a href="/refrigerator-leaking.html">Refrigerator Leaking</a></li>
          <li><a href="/washer-not-spinning.html">Washer Not Spinning</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about-service-area.html">About Us</a></li>
          <li><a href="/about-service-area.html#service-area">Service Area</a></li>
          <li><a href="/#get-quote">Get Free Estimate</a></li>
          <li><a href="tel:7325550100">Call (732) 555-0100</a></li>
        </ul>
      </div>

      <div class="footer-col footer-areas">
        <h4>Areas We Serve</h4>
        <div class="area-list">
          <span>Marlboro</span><span>Morganville</span><span>Englishtown</span>
          <span>Freehold</span><span>Holmdel</span><span>Hazlet</span>
          <span>Aberdeen</span><span>Matawan</span><span>Old Bridge</span>
          <span>Keyport</span><span>Keansburg</span><span>Colts Neck</span>
          <span>Tinton Falls</span><span>Neptune</span>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container" style="width:100%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <span>&copy; 2025 Marlboro Appliance Repair Pros. All rights reserved.</span>
      <span>Serving Marlboro, NJ 07746 &amp; Monmouth County</span>
    </div>
  </div>
</footer>

<div class="mobile-cta-bar" role="complementary" aria-label="Quick contact">
  <a href="tel:7325550100" class="call-btn" aria-label="Call us now">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    Call Now
  </a>
  <a href="#get-quote" class="form-btn" aria-label="Book service online">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    Book Online
  </a>
</div>

<script src="/js/main.js" defer></script>
```

---

## TRUST BAR HTML
```html
<div class="trust-bar" role="complementary" aria-label="Trust signals">
  <div class="container">
    <div class="trust-items">
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Same-Day Service
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Licensed &amp; Insured
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        No Hidden Fees
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        90-Day Labor Guarantee
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Local Marlboro, NJ Experts
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        500+ 5-Star Reviews
      </div>
    </div>
  </div>
</div>
```

---

## STATS BAR
```html
<section class="stats-bar" aria-label="Business statistics">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item"><span class="number">15+</span><span class="label">Years Serving NJ</span></div>
      <div class="stat-item"><span class="number">8,500+</span><span class="label">Repairs Completed</span></div>
      <div class="stat-item"><span class="number">500+</span><span class="label">5-Star Reviews</span></div>
      <div class="stat-item"><span class="number">98%</span><span class="label">Same-Day Fix Rate</span></div>
    </div>
  </div>
</section>
```

---

## CTA BANNER
```html
<section class="cta-banner" aria-labelledby="cta-heading">
  <div class="container">
    <h2 id="cta-heading">Appliance Acting Up? Don't Wait — We Fix It Today.</h2>
    <p>Marlboro's most trusted appliance repair team. Same-day service, upfront pricing, 90-day guarantee on all labor.</p>
    <div class="ctas">
      <a href="tel:7325550100" class="btn btn-primary btn-lg">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Call (732) 555-0100
      </a>
      <a href="#get-quote" class="btn btn-secondary btn-lg">Get Free Estimate</a>
    </div>
  </div>
</section>
```
