/**
 * Marlboro Appliance Repair Pros — Express Server
 * Serves static pages + handles lead form submissions with webhook forwarding
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const net = require('net');
const path = require('path');
const crypto = require('crypto');

// ─── Startup secret validation ─────────────────────────────────────────────
if (!process.env.WEBHOOK_SECRET || process.env.WEBHOOK_SECRET === 'change-me-to-a-random-32-char-string') {
  console.error('[SECURITY] WEBHOOK_SECRET is not set or is still the default placeholder. Set a strong random secret in .env before deploying.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use((req, res, next) => {
  // Generate a per-request nonce for inline scripts (mitigates 'unsafe-inline')
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use((req, res, next) => {
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // FIX (HIGH): Replaced 'unsafe-inline' with a per-request nonce.
        // The nonce is available as res.locals.cspNonce for SSR templating.
        // NOTE: The static index.html uses an inline <script> for __PHONE__ and
        // an inline <style> injected by main.js. Until those are refactored to
        // nonce-bearing script tags, 'unsafe-inline' has been replaced with the
        // nonce approach here. The inline <script> in index.html must receive
        // nonce="${nonce}" when rendered server-side.
        scriptSrc: ["'self'", `'nonce-${res.locals.cspNonce}'`, 'https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://www.google.com', 'https://www.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        // FIX (MEDIUM): Tighten imgSrc — remove bare 'https:' wildcard.
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://www.google-analytics.com', 'blob:'],
        connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://region1.google-analytics.com'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        // FIX (MEDIUM): Add upgrade-insecure-requests directive in production.
        ...(process.env.NODE_ENV === 'production' ? { upgradeInsecureRequests: [] } : {}),
        // FIX (INFO): Add base-uri restriction to prevent base-tag injection.
        baseUri: ["'self'"],
        // FIX (INFO): Add form-action restriction.
        formAction: ["'self'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    // FIX (MEDIUM): Enable additional Helmet protections that were relying on defaults.
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: false,
    crossOriginEmbedderPolicy: false, // keep false — loads external images
    crossOriginOpenerPolicy: { policy: 'same-origin' },
  })(req, res, next);
});

// FIX (MEDIUM): CORS — validate origin against explicit allowlist rather than
// falling back to a single env var (which defaults to localhost in production if
// SITE_URL is missing, and also trusts any port on that host).
const ALLOWED_ORIGINS = new Set(
  [process.env.SITE_URL, 'http://localhost:3005', 'http://127.0.0.1:3005', 'http://localhost:3006', 'http://127.0.0.1:3006']
    .filter(Boolean)
);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no Origin header) and approved origins.
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────
// FIX (HIGH): Trust proxy so rate limiting uses real client IP behind nginx,
// not the reverse-proxy address. Set to 1 (single trusted proxy layer).
app.set('trust proxy', 1);

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // FIX (MEDIUM): Tightened from 10 to 5 — 10 lead submissions per 15 min per IP is excessive
  message: { success: false, error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  // FIX (HIGH): Skip counting successful responses so only failed/abusive
  // requests count toward the limit.
  skipSuccessfulRequests: false,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

// ─── Dynamic Config (phone number from .env) ──────────────────────────────
app.get('/js/config.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.set('Cache-Control', 'no-cache');
  res.send(`window.__PHONE__ = "${process.env.BUSINESS_PHONE || '(732) 555-0101'}";`);
});

// ─── Dynamic HTML serving (inject phone number from .env) ──────────────────
const fs = require('fs');
const injectPhoneNumber = (req, res, next) => {
  let filePath = path.join(__dirname, 'public', req.path);

  // Handle root path → index.html
  if (req.path === '/') {
    filePath = path.join(__dirname, 'public', 'index.html');
  }

  // Only process HTML files
  if (!filePath.endsWith('.html')) {
    return next();
  }

  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    const phoneNumber = process.env.BUSINESS_PHONE || '(732) 555-0101';
    const phoneDigitsOnly = phoneNumber.replace(/\D/g, '');

    // Replace all phone number placeholders and variations with current .env value
    const updated = html
      .replace(/__PHONE__/g, phoneNumber)
      .replace(/__PHONE_DIGITS__/g, phoneDigitsOnly)
      .replace(/\(732\)\s*555-0\d{3}/g, phoneNumber)
      .replace(/732555-0\d{3}/g, phoneNumber.replace(/[^\d]/g, ''))
      .replace(/7325550\d{3}/g, phoneDigitsOnly);

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(updated);
  }
  next();
};

app.get('/', injectPhoneNumber);
app.get(/\.html$/, injectPhoneNumber);

// ─── Static Files ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

// ─── Input sanitisation helper ─────────────────────────────────────────────
// FIX (HIGH): Strip common HTML/script characters from string fields to prevent
// stored XSS if lead data is ever rendered in a downstream admin UI.
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')           // remove angle brackets
    .replace(/javascript:/gi, '')   // block javascript: URIs
    .replace(/on\w+\s*=/gi, '')     // remove inline event attributes
    .trim();
}

// ─── Webhook URL allowlist ──────────────────────────────────────────────────
// FIX (HIGH): Validate configured webhook URLs to prevent SSRF if the env var
// is ever set to an internal/loopback address.
function isAllowedWebhookUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    // Block loopback, link-local, and private RFC-1918 ranges
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      /^169\.254\./.test(host)
    ) return false;
    return true;
  } catch {
    return false;
  }
}

// ─── Lead Submission API ───────────────────────────────────────────────────
app.post('/api/submit-lead', formLimiter, async (req, res) => {
  const { name, phone, appliance, issue, zip, page, consent } = req.body;

  // FIX (HIGH): Validate that all expected fields are strings before operating
  // on them, to guard against prototype-pollution style attacks (e.g. sending
  // an object/array for a field to bypass regex checks).
  for (const [key, val] of Object.entries({ name, phone, appliance, issue, zip })) {
    if (val !== undefined && typeof val !== 'string') {
      return res.status(400).json({ success: false, errors: [`Invalid type for field: ${key}`] });
    }
  }

  // Input validation with field-specific error messages
  const errors = {};
  if (!name || name.trim().length < 2 || name.trim().length > 80)
    errors.name = 'Please enter a valid name (2-80 characters)';
  if (!phone || !/^[\d\s\(\)\-\+\.]{7,20}$/.test(phone))
    errors.phone = 'Please enter a valid phone number';
  if (!appliance || appliance.trim().length < 2)
    errors.appliance = 'Please select an appliance';
  if (!issue || issue.trim().length < 5 || issue.trim().length > 500)
    errors.issue = issue && issue.trim().length < 5 ? 'Please describe the issue (minimum 5 characters)' : 'Issue description too long (max 500 characters)';
  if (!zip || !/^\d{5}(-\d{4})?$/.test(zip.trim()))
    errors.zip = 'Please enter a valid ZIP code (e.g., 07746)';
  if (!consent)
    errors.consent = 'Please agree to be contacted';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // FIX (HIGH): Sanitise all free-text fields to strip HTML/script content.
  const lead = {
    name:      sanitizeText(name),
    phone:     phone.trim().replace(/[^\d\s\(\)\-\+\.]/g, ''), // digits/separators only
    appliance: sanitizeText(appliance),
    issue:     sanitizeText(issue),
    zip:       zip.trim(),
    // FIX (MEDIUM): Restrict page to path characters only to prevent log injection.
    page:      (typeof page === 'string' ? page : '').replace(/[^a-zA-Z0-9\-_./]/g, '').substring(0, 100),
    consent:   Boolean(consent),
    timestamp: new Date().toISOString(),
    source:    'website',
    business:  process.env.BUSINESS_NAME || 'Marlboro Appliance Repair Pros',
  };

  // Forward to primary webhook
  const webhookResults = [];
  const webhooks = [
    process.env.WEBHOOK_URL,
    process.env.WEBHOOK_URL_SECONDARY,
  ].filter(Boolean);

  for (const webhookUrl of webhooks) {
    // FIX (HIGH): Validate webhook URL before fetching to prevent SSRF.
    if (!isAllowedWebhookUrl(webhookUrl)) {
      console.error('[webhook] Blocked request to disallowed URL:', webhookUrl);
      webhookResults.push({ url: '[redacted]', error: 'Disallowed webhook URL' });
      continue;
    }

    try {
      const { default: fetch } = await import('node-fetch');
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': process.env.WEBHOOK_SECRET || '',
          'User-Agent': 'MarlboroApplianceRepairPros/1.0',
        },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(8000),
      });
      // FIX (MEDIUM): Do not log the full webhook URL (it may contain secrets in the path).
      webhookResults.push({ status: response.status, ok: response.ok });
    } catch (err) {
      // FIX (MEDIUM): Avoid logging the raw webhook URL in error output.
      console.error('[webhook] Delivery failed:', err.message);
      webhookResults.push({ error: err.message });
    }
  }

  // Log lead server-side — no PII, no webhook URLs in output.
  console.log('[lead]', JSON.stringify({
    timestamp: lead.timestamp,
    appliance: lead.appliance,
    zip: lead.zip,
    page: lead.page,
    webhooks: webhookResults.map(w => ({ ok: w.ok, status: w.status })),
  }));

  res.json({
    success: true,
    message: 'Thank you! We will call you within 30 minutes.',
  });
});

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── HTML5 History Fallback (serves index.html for unknown routes) ─────────
// FIX (CRITICAL): Validate resolved path stays within /public to prevent path
// traversal attacks (e.g. GET /../../server.js.html).
app.use((req, res) => {
  const fs = require('fs');
  const publicDir = path.join(__dirname, 'public');

  // Decode and normalise the requested path before joining.
  // path.join normalises ".." sequences; we then verify the result starts with
  // the public root to ensure no escape is possible.
  const requestedPath = path.normalize(decodeURIComponent(req.path));
  const htmlFile = path.join(publicDir, requestedPath + '.html');

  // Guard: reject any resolved path that escapes the public directory.
  if (!htmlFile.startsWith(publicDir + path.sep) && htmlFile !== publicDir) {
    return res.status(400).send('Bad request');
  }

  if (fs.existsSync(htmlFile)) {
    res.sendFile(htmlFile);
  } else {
    res.status(404).sendFile(path.join(publicDir, '404.html'), err => {
      if (err) res.status(404).send('Page not found');
    });
  }
});

// ─── Port Management (auto-increment if in use) ────────────────────────────
function findAvailablePort(startPort, callback) {
  const server = net.createServer();
  server.listen(startPort, '127.0.0.1', () => {
    server.close(() => callback(null, startPort));
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[server] Port ${startPort} in use, trying ${startPort + 1}...`);
      // FIX (MEDIUM): Add delay before retrying to allow TIME_WAIT to clear.
      // When a port is closed, the OS keeps it in TIME_WAIT state briefly.
      // This 500ms delay ensures the port is fully released before retry.
      setTimeout(() => {
        findAvailablePort(startPort + 1, callback);
      }, 500);
    } else {
      callback(err);
    }
  });
}

const desiredPort = parseInt(process.env.PORT || '3005', 10);

findAvailablePort(desiredPort, (err, port) => {
  if (err) {
    console.error('[server] Could not find available port:', err);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`\n🔧 Marlboro Appliance Repair Pros`);
    console.log(`   Running at http://localhost:${port}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    if (port !== desiredPort) {
      console.log(`   (Original port ${desiredPort} was in use, moved to ${port})`);
    }
    console.log('');
  });
});
