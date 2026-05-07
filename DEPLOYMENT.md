# Deployment Guide — Marlboro Appliance Repair Pros

## Quick Start (Local Development)

```bash
cd /path/to/site
cp .env.example .env          # Edit .env with real values
npm install
npm start
# Open http://localhost:3005
```

---

## Production Deployment

### Option A: VPS/Dedicated Server (Recommended)

**Requirements:**
- Ubuntu 22.04+ or Debian 11+
- Node.js 18+
- Nginx
- PM2
- Certbot (for free HTTPS)

**Steps:**

```bash
# 1. Upload files to server
scp -r ./site user@your-server:/var/www/marlboro-appliance-repair/

# 2. SSH into server
ssh user@your-server
cd /var/www/marlboro-appliance-repair

# 3. Create .env from example
cp .env.example .env
nano .env   # Fill in WEBHOOK_URL, BUSINESS_PHONE, WEBHOOK_SECRET, etc.

# 4. Run deploy script (handles npm install, PM2, nginx, SSL)
chmod +x deploy.sh
sudo ./deploy.sh production
```

**The deploy.sh script automatically:**
- Installs npm dependencies
- Starts the app with PM2 (auto-restart on crash)
- Configures nginx as reverse proxy on port 3005
- Sets up free SSL via Let's Encrypt
- Runs a health check

---

### Option B: Shared Hosting / cPanel

If your host supports Node.js apps:

1. Upload all files via FTP/SFTP
2. In cPanel → "Node.js App" → Create app:
   - Node.js version: 18+
   - Application root: `site/`
   - Application startup file: `server.js`
3. Set environment variables in the cPanel Node.js section
4. Click "Start Application"

---

### Option C: Platform as a Service

**Railway.app** (easiest, ~$5/month):
```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway env set WEBHOOK_URL=https://... BUSINESS_PHONE="(732) 555-0100"
```

**Render.com** (free tier available):
1. Connect GitHub repo to Render
2. New Web Service → select repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables in Render dashboard

**DigitalOcean App Platform:**
1. New App → GitHub repo
2. Auto-detects Node.js
3. Add environment variables
4. Deploy

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3005, auto-increments if in use) |
| `NODE_ENV` | Yes | `production` or `development` |
| `BUSINESS_PHONE` | Yes | Displayed phone number: `(732) 555-0100` |
| `BUSINESS_EMAIL` | Yes | Business email |
| `SITE_URL` | Yes | Full URL: `https://marlboroappliancerepairpros.com` |
| `WEBHOOK_URL` | Yes | Zapier/Make/GHL webhook URL for leads |
| `WEBHOOK_SECRET` | Yes | Secret header for webhook security |
| `WEBHOOK_URL_SECONDARY` | No | Backup webhook URL |
| `GA4_MEASUREMENT_ID` | No | Google Analytics 4 ID |
| `RECAPTCHA_SITE_KEY` | No | reCAPTCHA v2/v3 site key |
| `RECAPTCHA_SECRET_KEY` | No | reCAPTCHA secret key |

---

## Webhook Integration

When a lead form is submitted, the server POSTs this JSON to your WEBHOOK_URL:

```json
{
  "name": "Jane Smith",
  "phone": "(732) 555-0198",
  "appliance": "Dryer",
  "issue": "Dryer runs but clothes stay cold.",
  "zip": "07746",
  "page": "/dryer-not-heating.html",
  "consent": true,
  "timestamp": "2025-05-06T14:30:00.000Z",
  "source": "website",
  "business": "Marlboro Appliance Repair Pros"
}
```

**Headers sent:**
```
Content-Type: application/json
X-Webhook-Secret: [your WEBHOOK_SECRET value]
User-Agent: MarlboroApplianceRepairPros/1.0
```

### Setting Up Zapier
1. Create a Zapier account at zapier.com
2. New Zap → Trigger: Webhooks by Zapier → Catch Hook
3. Copy the webhook URL → paste into `.env` as `WEBHOOK_URL`
4. Action: Gmail (send email notification) or Google Sheets (log lead) or SMS
5. Test with a real form submission

### Setting Up Go High Level (GHL)
1. In GHL → Settings → Integrations → Webhooks
2. Add inbound webhook, copy URL
3. Map fields: name → name, phone → phone, etc.
4. Paste URL into `.env` as `WEBHOOK_URL`

### Setting Up Make (formerly Integromat)
1. New scenario → Webhooks → Custom webhook
2. Copy URL → paste into `.env`
3. Add modules: Google Sheets + Email + SMS notification

---

## Domain & DNS Setup

1. Register domain at Namecheap/GoDaddy/Cloudflare
2. Point DNS A record to your server IP
3. Add CNAME `www` → `marlboroappliancerepairpros.com`
4. Wait for DNS propagation (up to 48 hours)
5. Run `sudo certbot --nginx` for free SSL

**Recommended: Use Cloudflare as DNS proxy**
- Free CDN + DDoS protection
- Automatic HTTPS
- Performance boost

---

## Updating the Phone Number

The phone number is set in `.env` as `BUSINESS_PHONE`. It's also hardcoded in:
- Each HTML page: `<a href="tel:7325550100">` links
- `window.__PHONE__` script tag (for JS injection)

To update: do a find-replace across all HTML files and `.env`.

---

## Monitoring & Maintenance

```bash
# View live logs
pm2 logs marlboro-appliance-repair

# Check app status
pm2 status

# Restart app
pm2 restart marlboro-appliance-repair

# View nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check server health
curl http://localhost:3005/health
```

---

## Security Notes

- `.env` is in `.gitignore` — never commit it
- `WEBHOOK_SECRET` verifies lead payloads are from your server
- Helmet.js sets all security headers — ✅
- Rate limiting: 10 form submissions per IP per 15 minutes — ✅
- Input validation on both client and server side — ✅
- No database = no SQL injection risk
- All user input is sanitized before forwarding to webhook
