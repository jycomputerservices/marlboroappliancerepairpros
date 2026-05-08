#!/usr/bin/env bash
# =============================================================================
# Marlboro Appliance Repair Pros — Deployment Script
# Usage: ./deploy.sh [staging|production]
# =============================================================================
set -e

ENVIRONMENT="${1:-production}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="marlboro-appliance-repair"
SERVICE_USER="${SERVICE_USER:-$(id -un)}"
SERVICE_GROUP="${SERVICE_GROUP:-$(id -gn)}"
LOG_DIR="${LOG_DIR:-/var/log/${APP_NAME}}"
LOG_FILE="${LOG_DIR}/deploy.log"

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Preflight Checks ─────────────────────────────────────────────────────────
info "Starting deployment — environment: ${ENVIRONMENT}"

command -v node  &>/dev/null || error "Node.js is not installed. Install Node.js 18+ first."
command -v npm   &>/dev/null || error "npm is not installed."
command -v nginx &>/dev/null || warn "nginx not found — skipping nginx config."
if ! command -v pm2 &>/dev/null; then
  warn "pm2 not found — installing globally..."
  npm install -g pm2 2>/dev/null || { warn "Failed to install pm2 globally, trying with sudo..."; sudo npm install -g pm2; }
fi

NODE_VERSION=$(node -v | grep -oE '[0-9]+' | head -1)
if [ "$NODE_VERSION" -lt 18 ]; then
  error "Node.js 18+ required. Found: $(node -v)"
fi

# ─── .env Check ───────────────────────────────────────────────────────────────
if [ ! -f "${APP_DIR}/.env" ]; then
  warn ".env file not found. Copying from .env.example..."
  cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
  error "Please edit .env with real values before deploying, then run this script again."
fi

# Check required env vars
source "${APP_DIR}/.env"
[ -z "$BUSINESS_PHONE" ]  && warn "BUSINESS_PHONE not set in .env"
[ -z "$WEBHOOK_URL" ]     && warn "WEBHOOK_URL not set in .env — leads will not be forwarded"
[ -z "$WEBHOOK_SECRET" ]  && warn "WEBHOOK_SECRET not set — webhook security disabled"

# ─── Install Dependencies ─────────────────────────────────────────────────────
info "Installing Node.js dependencies..."
cd "${APP_DIR}"
npm ci --omit=dev 2>&1 | tail -5
success "Dependencies installed."

# ─── Create Log Directory ─────────────────────────────────────────────────────
if [ ! -d "${LOG_DIR}" ]; then
  if mkdir -p "${LOG_DIR}" 2>/dev/null; then
    :
  elif command -v sudo &>/dev/null; then
    sudo -n mkdir -p "${LOG_DIR}" 2>/dev/null || true
  fi
fi

if [ -d "${LOG_DIR}" ] && [ ! -w "${LOG_DIR}" ] && command -v sudo &>/dev/null; then
  sudo -n chown "${SERVICE_USER}:${SERVICE_GROUP}" "${LOG_DIR}" 2>/dev/null || true
fi

if [ ! -d "${LOG_DIR}" ] || [ ! -w "${LOG_DIR}" ]; then
  warn "Cannot write to ${LOG_DIR}; using project logs directory instead."
  LOG_DIR="${APP_DIR}/logs"
  LOG_FILE="${LOG_DIR}/deploy.log"
  mkdir -p "${LOG_DIR}"
fi

# ─── Kill Existing Process on Port 3005 ──────────────────────────────────────
PORT="${PORT:-3005}"
info "Checking for existing process on port ${PORT}..."

# Find PID listening on the specified port
EXISTING_PID=$(lsof -ti:${PORT} 2>/dev/null || true)

if [ -n "$EXISTING_PID" ]; then
  info "Found process on port ${PORT} (PID: ${EXISTING_PID}). Terminating..."
  kill -TERM "$EXISTING_PID" 2>/dev/null || true

  # Wait for graceful shutdown (up to 5 seconds)
  for i in {1..5}; do
    if ! kill -0 "$EXISTING_PID" 2>/dev/null; then
      success "Process ${EXISTING_PID} terminated gracefully."
      break
    fi
    sleep 1
  done

  # Force kill if still running
  if kill -0 "$EXISTING_PID" 2>/dev/null; then
    warn "Process did not terminate gracefully. Force killing..."
    kill -9 "$EXISTING_PID" 2>/dev/null || true
    success "Process ${EXISTING_PID} force killed."
  fi

  # Brief pause to ensure port is fully released
  sleep 1
fi

# ─── PM2 Process Management ───────────────────────────────────────────────────
info "Starting/restarting app with PM2..."
if pm2 describe "${APP_NAME}" &>/dev/null; then
  pm2 restart "${APP_NAME}" --update-env
  success "App restarted via PM2."
else
  pm2 start server.js \
    --name "${APP_NAME}" \
    --env "${ENVIRONMENT}" \
    --log "${LOG_DIR}/app.log" \
    --error "${LOG_DIR}/error.log" \
    --time \
    --restart-delay 3000 \
    --max-restarts 10
  success "App started via PM2."
fi

pm2 save
info "PM2 startup: run 'pm2 startup' to auto-start on server reboot."

# ─── Nginx Config (optional) ──────────────────────────────────────────────────
if command -v nginx &>/dev/null; then
  NGINX_CONF="/etc/nginx/sites-available/${APP_NAME}"
  NGINX_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"
  PORT="${PORT:-3005}"

  info "Writing nginx reverse proxy config..."
  sudo tee "${NGINX_CONF}" > /dev/null <<NGINX
# Marlboro Appliance Repair Pros — Nginx Reverse Proxy
server {
    listen 80;
    server_name marlboroappliancerepairpros.com www.marlboroappliancerepairpros.com;

    # Redirect www to non-www
    if (\$host = www.marlboroappliancerepairpros.com) {
        return 301 https://marlboroappliancerepairpros.com\$request_uri;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static file caching
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        expires 7d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML — no cache (for SEO freshness)
    location ~* \.html$ {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;

        # Rate limit for API
        limit_req zone=api burst=20 nodelay;
    }

    # Default proxy
    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

  # Add rate limit zone to nginx.conf if not already present
  if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf 2>/dev/null; then
    warn "Add this to your /etc/nginx/nginx.conf http{} block manually:"
    echo "    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/m;"
  fi

  [ ! -L "${NGINX_ENABLED}" ] && sudo ln -sf "${NGINX_CONF}" "${NGINX_ENABLED}"
  sudo nginx -t && sudo systemctl reload nginx
  success "Nginx configured and reloaded."

  # ─── SSL with Certbot ─────────────────────────────────────────────────────
  if command -v certbot &>/dev/null; then
    info "Setting up SSL certificate via Let's Encrypt..."
    DOMAIN="${SITE_URL:-marlboroappliancerepairpros.com}"
    DOMAIN="${DOMAIN#https://}"
    sudo certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" \
      --non-interactive --agree-tos --email "${BUSINESS_EMAIL:-admin@${DOMAIN}}" \
      --redirect || warn "SSL setup failed — set up manually with: sudo certbot --nginx"
    success "SSL configured."
  else
    warn "certbot not installed. Install it for free HTTPS: sudo snap install certbot --classic"
  fi
fi

# ─── Health Check ─────────────────────────────────────────────────────────────
info "Running health check..."
sleep 2
ACTUAL_PORT="${PORT:-3005}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${ACTUAL_PORT}/health" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
  success "Health check passed (HTTP ${HTTP_STATUS})."
else
  warn "Health check returned HTTP ${HTTP_STATUS}. Check logs: pm2 logs ${APP_NAME}"
fi

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
success "Deployment complete!"
echo ""
echo "  App:      http://localhost:${PORT:-3005}"
echo "  PM2:      pm2 logs ${APP_NAME}"
echo "  Nginx:    sudo nginx -t && sudo systemctl reload nginx"
echo "  SSL:      sudo certbot --nginx -d marlboroappliancerepairpros.com"
echo ""
