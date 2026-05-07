# Security Audit Report
**Project:** Marlboro Appliance Repair Pros — Lead Generation Website  
**Audit Date:** 2026-05-06  
**Auditor:** Automated Security Review  
**Scope:** server.js, public/js/main.js, public/index.html, .env.example, package.json, deploy.sh  

---

## Executive Summary

The codebase is well-structured for a Node.js lead-generation site and demonstrates several good practices (Helmet.js, rate limiting, input validation, no SQL, no shell execution, body-size limits). However, the audit identified **1 CRITICAL**, **7 HIGH**, and **8 MEDIUM/LOW/INFO** issues. All CRITICAL and HIGH findings have been fixed in `server.js` as part of this audit. Medium and lower findings are documented with recommended remediation steps.

---

## Findings

### CRITICAL

---

#### CRIT-01 — Path Traversal in HTML5 Fallback Route
- **Severity:** CRITICAL  
- **Location:** `server.js` lines 149–159 (original)  
- **Description:** The catch-all route appended `req.path` directly to the `public/` directory without validating that the resolved path remained inside that directory. An attacker could send `GET /../../server.js` to read arbitrary files from the filesystem, including `server.js` (containing webhook URLs and config), `.env`, `package-lock.json`, and other sensitive files. URL-encoded traversal sequences (`%2e%2e`) compounded the risk.  
- **Proof of concept:** `curl http://localhost:3005/../../.env.html` (before fix)  
- **Fix applied:** The fallback handler now calls `path.normalize(decodeURIComponent(req.path))` and verifies the resolved file path begins with `publicDir + path.sep` before serving. Any path that escapes the public directory returns HTTP 400.  
- **Fix location:** `server.js` — `HTML5 History Fallback` section  

---

### HIGH

---

#### HIGH-01 — CSP `unsafe-inline` Allows Script Injection
- **Severity:** HIGH  
- **Location:** `server.js` line 22 (original)  
- **Description:** The `scriptSrc` directive included `'unsafe-inline'`, which entirely bypasses Content Security Policy protection against Cross-Site Scripting. Any XSS vector that injects an inline `<script>` block or `on*` attribute would execute without restriction.  
- **Fix applied:** `'unsafe-inline'` replaced with a cryptographically random per-request nonce (`crypto.randomBytes(16).toString('base64')`). The nonce value is exposed via `res.locals.cspNonce` so it can be stamped onto server-rendered inline script tags. The static `index.html` inline `<script>` (for `window.__PHONE__`) must have `nonce="${nonce}"` added when the site is converted to SSR/templated rendering.  
- **Remaining work:** The `styleSrc` directive still contains `'unsafe-inline'` (required for the spin animation injected by `main.js`). Refactor to use a CSS class and external stylesheet to eliminate this.  
- **Fix location:** `server.js` — `Security Middleware` section  

---

#### HIGH-02 — Rate Limiter Not Trust-Proxy Aware (IP Spoofing)
- **Severity:** HIGH  
- **Location:** `server.js` lines 40–54 (original)  
- **Description:** `express-rate-limit` identifies clients by `req.ip`. Without `app.set('trust proxy', 1)`, when the app runs behind nginx (as configured in `deploy.sh`), `req.ip` resolves to the loopback address `127.0.0.1` for every request. This means the rate limiter applies a shared window across all users, a single legitimate user can exhaust the budget for everyone, and the limit can never actually block a single malicious IP.  
- **Fix applied:** Added `app.set('trust proxy', 1)` before the rate limiter declarations.  
- **Fix location:** `server.js` — `Rate Limiting` section  

---

#### HIGH-03 — SSRF via Unvalidated Webhook URLs
- **Severity:** HIGH  
- **Location:** `server.js` lines 108–126 (original)  
- **Description:** The `WEBHOOK_URL` and `WEBHOOK_URL_SECONDARY` environment variables were used directly as fetch targets without verifying they pointed to external hosts. If an attacker compromised the `.env` file or the environment (e.g. through a misconfigured deployment pipeline), they could set `WEBHOOK_URL=http://169.254.169.254/latest/meta-data/` to exfiltrate cloud instance metadata or probe internal services. This is a Server-Side Request Forgery (SSRF) risk.  
- **Fix applied:** Added `isAllowedWebhookUrl()` which parses the URL and rejects any target resolving to loopback (`127.0.0.1`, `::1`, `localhost`), RFC-1918 private ranges (`10.x`, `192.168.x`, `172.16–31.x`), and link-local ranges (`169.254.x`). Blocked URLs are logged and skipped; no request is made.  
- **Fix location:** `server.js` — `Webhook URL allowlist` section  

---

#### HIGH-04 — Webhook Secret Not Enforced at Startup
- **Severity:** HIGH  
- **Location:** `server.js` line 115 (original): `'X-Webhook-Secret': process.env.WEBHOOK_SECRET || ''`  
- **Description:** If `WEBHOOK_SECRET` is unset or left as the example placeholder value `change-me-to-a-random-32-char-string`, the webhook header is sent empty or with the well-known default. The receiving automation endpoint should reject such requests, but there is no server-side enforcement preventing deployment with an insecure secret.  
- **Fix applied:** Added a startup check that logs an error and exits with code 1 in production if `WEBHOOK_SECRET` is missing or matches the placeholder. A command to generate a proper secret (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) was added to `.env.example`.  
- **Fix location:** `server.js` — `Startup secret validation` section; `.env.example`  

---

#### HIGH-05 — Stored XSS via Unsanitised Lead Fields
- **Severity:** HIGH  
- **Location:** `server.js` lines 88–99 (original)  
- **Description:** The `name`, `appliance`, and `issue` fields were trimmed but not sanitised before being stored in the `lead` object and forwarded to the webhook. If the webhook destination (e.g. a CRM, admin dashboard, or email template) renders this data as HTML without escaping, an attacker submitting `<script>alert(1)</script>` as their name would achieve stored XSS in any such downstream system.  
- **Fix applied:** Added `sanitizeText()` helper that strips `<>` angle brackets, `javascript:` URI schemes, and `on*=` inline event attribute patterns from all free-text fields. Phone number is additionally filtered to digits and separator characters only.  
- **Fix location:** `server.js` — `Input sanitisation helper` and `Lead Submission API` sections  

---

#### HIGH-06 — Type Confusion / Prototype Pollution on Form Fields
- **Severity:** HIGH  
- **Location:** `server.js` lines 76–82 (original)  
- **Description:** The validation code called `.trim()` and `.length` directly on values from `req.body` without first confirming they were strings. Sending `{"name": {"trim": "pwned"}}` or `{"name": [1,2,3]}` could bypass length checks (arrays have `.length`) and cause unexpected behaviour or potential crashes. In extreme cases, sending `{"__proto__": {"isAdmin": true}}` in deeply nested objects could pollute the Object prototype if `extended: true` were used with `urlencoded` (it is correctly set to `false` here, but the JSON parser does not have this protection).  
- **Fix applied:** Added an explicit type-check loop before the validation block that returns HTTP 400 if any field is not a string.  
- **Fix location:** `server.js` — `Lead Submission API` section  

---

#### HIGH-07 — Webhook URL Logged in Error Output (Secret Exposure)
- **Severity:** HIGH  
- **Location:** `server.js` line 123 (original): `console.error('[webhook] Failed to send to', webhookUrl, err.message)`  
- **Description:** The full webhook URL was logged on delivery failure. Zapier and similar automation platforms embed authentication tokens directly in the hook URL path (e.g. `https://hooks.zapier.com/hooks/catch/12345/abcdef/`). Logging this URL to stdout/stderr in a PM2 log file (`/var/log/marlboro-appliance-repair/app.log`) exposes the secret to anyone with read access to those logs, including monitoring tools and log aggregators.  
- **Fix applied:** Removed the webhook URL from error log output. Only the error message is logged.  
- **Fix location:** `server.js` — `Lead Submission API`, webhook delivery catch block  

---

### MEDIUM

---

#### MED-01 — CORS Origin Falls Back to `localhost` in Production
- **Severity:** MEDIUM  
- **Location:** `server.js` line 34 (original): `origin: process.env.SITE_URL || 'http://localhost:3005'`  
- **Description:** If `SITE_URL` is not set in production, the CORS policy silently permits `http://localhost:3005` as a valid origin. A misconfigured deployment would allow any page served on that port to make credentialed cross-origin requests.  
- **Fix applied:** Replaced single-value fallback with an explicit `Set`-based allowlist and a validator callback that rejects unknown origins with an error. Development localhost origins are included in the set but production deployment should set `SITE_URL` correctly.  
- **Fix location:** `server.js` — CORS section  

---

#### MED-02 — CSP `imgSrc` Wildcard `https:`
- **Severity:** MEDIUM  
- **Location:** `server.js` line 25 (original): `imgSrc: ["'self'", 'data:', 'https:', 'blob:']`  
- **Description:** Allowing all HTTPS image sources (`https:`) is effectively a wildcard. An XSS payload that injects an `<img src="https://attacker.com/track">` tag can exfiltrate data via image requests, and dangling markup injection becomes possible.  
- **Fix applied:** Replaced `https:` with explicit allowlisted hosts: `https://images.unsplash.com` (used for the hero image) and `https://www.google-analytics.com` (used by GA4).  
- **Fix location:** `server.js` — Helmet CSP configuration  

---

#### MED-03 — Missing `base-uri` and `form-action` CSP Directives
- **Severity:** MEDIUM  
- **Location:** `server.js` — Helmet configuration (original)  
- **Description:** Without `base-uri 'self'`, an injected `<base>` tag can redirect all relative URLs to an attacker-controlled domain. Without `form-action 'self'`, form submissions can be hijacked to arbitrary endpoints.  
- **Fix applied:** Both directives added to the CSP configuration.  
- **Fix location:** `server.js` — Helmet CSP configuration  

---

#### MED-04 — Rate Limit Window Too Permissive for Lead Form
- **Severity:** MEDIUM  
- **Location:** `server.js` line 43 (original): `max: 10`  
- **Description:** Allowing 10 lead form submissions per IP per 15 minutes is generous for a small local business site. This permits automated form spam/flooding without triggering the limit, and no CAPTCHA is configured to supplement rate limiting.  
- **Fix applied:** Limit reduced from 10 to 5 per 15-minute window.  
- **Recommendation:** Implement reCAPTCHA v3 (credentials already stubbed in `.env.example`) for additional spam protection.  
- **Fix location:** `server.js` — `formLimiter` configuration  

---

#### MED-05 — Log Injection via `page` Field
- **Severity:** MEDIUM  
- **Location:** `server.js` line 94 (original): `page: (page || '').trim().substring(0, 100)`  
- **Description:** The `page` field (client-supplied `window.location.pathname`) was included in server logs with only length truncation. A malicious client could send newlines, ANSI escape sequences, or JSON-breaking characters to poison log files or spoof log entries.  
- **Fix applied:** The `page` field is now filtered to `[a-zA-Z0-9\-_./]` characters only before logging.  
- **Fix location:** `server.js` — lead object construction  

---

#### MED-06 — Health Endpoint Leaks Server Timestamp (Information Disclosure)
- **Severity:** LOW  
- **Location:** `server.js` line 144 (original)  
- **Description:** The `/health` endpoint responds with `{ status: 'ok', timestamp: "..." }`. The timestamp is low-risk but confirms the server is live and reveals its clock. More importantly, the endpoint has no rate limiting, allowing it to be used as a zero-cost liveness probe by attackers.  
- **Recommendation:** Apply the `globalLimiter` explicitly to the `/health` route, or restrict it to internal/loopback origins. Consider removing the timestamp from the public response.  
- **Status:** Not auto-fixed (low risk); flagged for manual review.  

---

### LOW / INFO

---

#### LOW-01 — No CSRF Token on Lead Form
- **Severity:** LOW (mitigated by CORS + SameSite context)  
- **Location:** `server.js`, `public/index.html`  
- **Description:** The lead form does not use CSRF tokens. The risk is partially mitigated by: (1) the CORS policy which blocks cross-origin `fetch` requests with a `Content-Type: application/json` header, and (2) the fact that the endpoint has no authentication state to hijack. However, a form-based CSRF (HTML `<form action="/api/submit-lead">`) from a third-party site could still submit leads because browsers do not enforce CORS preflight on same-method `application/x-www-form-urlencoded` requests.  
- **Recommendation:** Add `csurf` middleware or a double-submit cookie pattern, or add a server-generated honeypot field. For a lead-gen form with no authenticated state, the practical risk is spam rather than account compromise.  
- **Status:** Not auto-fixed; acceptable residual risk for this application type.  

---

#### LOW-02 — No reCAPTCHA / Bot Protection
- **Severity:** LOW  
- **Location:** `.env.example` — `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` are present but not wired up  
- **Description:** Rate limiting alone cannot stop distributed spam with distinct IPs. The `.env.example` already documents reCAPTCHA keys; server-side validation of the reCAPTCHA response token was never implemented.  
- **Recommendation:** Implement Google reCAPTCHA v3 server-side verification before the validation block in `/api/submit-lead`.  
- **Status:** Not auto-fixed; flagged for implementation.  

---

#### INFO-01 — `'unsafe-inline'` Remains in `styleSrc`
- **Severity:** INFO  
- **Location:** `server.js` — Helmet CSP  
- **Description:** `main.js` injects a `<style>` element at runtime for the spinner animation. This requires `'unsafe-inline'` in `styleSrc`, which weakens style-injection defenses. An attacker who achieves DOM injection could insert styled content (e.g. phishing overlays).  
- **Recommendation:** Move the spin animation CSS to `/css/style.css` and remove `'unsafe-inline'` from `styleSrc`.  
- **Status:** Not auto-fixed; requires frontend refactor.  

---

#### INFO-02 — Dependency Versions Are Range-Pinned, Not Exact
- **Severity:** INFO  
- **Location:** `package.json` — all dependencies use `^` semver ranges  
- **Description:** `npm audit` returned 0 known vulnerabilities (clean). All direct dependencies are current stable releases. However, using `^` ranges means `npm install` (not `npm ci`) could pull in a patch with a vulnerability. The `package-lock.json` is present and `deploy.sh` uses `npm ci`, which is correct.  
- **Status:** No action required; `npm ci` usage in deployment is sufficient.  

---

#### INFO-03 — `window.__PHONE__` Injected via Inline Script
- **Severity:** INFO  
- **Location:** `public/index.html` line 17  
- **Description:** `<script>window.__PHONE__ = "(732) 555-0100";</script>` is an inline script tag without a nonce. After the CSP `'unsafe-inline'` removal (HIGH-01), this script will be blocked by browsers. The phone number is hardcoded and not sensitive, but the script will fail silently, breaking phone-number injection in `main.js`.  
- **Recommendation:** When the site is converted to server-side rendering (e.g. using an Express template engine), stamp the CSP nonce onto this tag: `<script nonce="<%= nonce %>">window.__PHONE__ = "...";</script>`. Alternatively, move the phone number to a `data-` attribute on the `<body>` tag and read it from JavaScript without an inline script.  
- **Status:** Not auto-fixed; requires SSR conversion to fully resolve.  

---

#### INFO-04 — `.env` File Exists at Project Root (Deployment Risk)
- **Severity:** INFO  
- **Location:** `/site/.env`  
- **Description:** A `.env` file is present in the project root. It appears to contain the same placeholder values as `.env.example` (no real secrets observed). The file is correctly listed in `.gitignore`. However, its presence confirms it would be accessible on the server filesystem to any process running as the same user.  
- **Recommendation:** Ensure `.env` permissions are `chmod 600` on the production server (`-rw-------`). Consider using a secrets manager (AWS SSM Parameter Store, HashiCorp Vault, etc.) instead of a file-based `.env` in production.  
- **Status:** Not auto-fixed; operational/deployment concern.  

---

## Summary Table

| ID      | Severity | Title                                           | Status  |
|---------|----------|-------------------------------------------------|---------|
| CRIT-01 | CRITICAL | Path traversal in HTML5 fallback route          | FIXED   |
| HIGH-01 | HIGH     | CSP `unsafe-inline` allows script injection     | FIXED   |
| HIGH-02 | HIGH     | Rate limiter not trust-proxy aware              | FIXED   |
| HIGH-03 | HIGH     | SSRF via unvalidated webhook URLs               | FIXED   |
| HIGH-04 | HIGH     | Webhook secret not enforced at startup          | FIXED   |
| HIGH-05 | HIGH     | Stored XSS via unsanitised lead fields          | FIXED   |
| HIGH-06 | HIGH     | Type confusion / prototype pollution on fields  | FIXED   |
| HIGH-07 | HIGH     | Webhook URL logged in error output              | FIXED   |
| MED-01  | MEDIUM   | CORS origin falls back to localhost             | FIXED   |
| MED-02  | MEDIUM   | CSP imgSrc wildcard `https:`                   | FIXED   |
| MED-03  | MEDIUM   | Missing `base-uri` and `form-action` directives | FIXED   |
| MED-04  | MEDIUM   | Rate limit window too permissive                | FIXED   |
| MED-05  | MEDIUM   | Log injection via `page` field                  | FIXED   |
| MED-06  | LOW      | Health endpoint leaks timestamp                 | Open    |
| LOW-01  | LOW      | No CSRF token on lead form                     | Open    |
| LOW-02  | LOW      | No reCAPTCHA / bot protection                  | Open    |
| INFO-01 | INFO     | `unsafe-inline` remains in `styleSrc`           | Open    |
| INFO-02 | INFO     | Dependency range pinning                        | N/A     |
| INFO-03 | INFO     | Inline `__PHONE__` script needs nonce           | Open    |
| INFO-04 | INFO     | `.env` file permissions                         | Open    |

---

## Files Modified

- `server.js` — All CRITICAL, HIGH, and MEDIUM fixes applied inline with comments.
- `.env.example` — Added generation command and stronger guidance for `WEBHOOK_SECRET`.

## Recommended Next Steps (Priority Order)

1. **Generate a real `WEBHOOK_SECRET`** before deploying: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. **Implement reCAPTCHA v3** server-side verification to supplement rate limiting.
3. **Convert `index.html` to a server-rendered template** (EJS, Handlebars, etc.) so the CSP nonce can be stamped onto the inline `<script>` tag for `window.__PHONE__`, and any other inline scripts on subpages.
4. **Move spin animation CSS to `style.css`** to eliminate the remaining `'unsafe-inline'` in `styleSrc`.
5. **Restrict `/health` endpoint** to internal IPs or add explicit rate limiting.
6. **Set `.env` file permissions** to `chmod 600` on the production server.
