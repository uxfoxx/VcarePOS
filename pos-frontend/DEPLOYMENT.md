# VCare POS System - Production Deployment Guide

This guide covers deploying the VCare POS System to production environments with best practices for security, performance, and reliability.

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Server Requirements](#server-requirements)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Domain and SSL Setup](#domain-and-ssl-setup)
5. [Server Setup](#server-setup)
6. [Database Configuration](#database-configuration)
7. [Backend Deployment](#backend-deployment)
8. [Frontend Deployment](#frontend-deployment)
9. [PM2 Process Management](#pm2-process-management)
10. [Nginx Reverse Proxy](#nginx-reverse-proxy)
11. [SSL/HTTPS Configuration](#sslhttps-configuration)
12. [Environment Variables](#environment-variables)
13. [Monitoring and Logging](#monitoring-and-logging)
14. [Backup Strategy](#backup-strategy)
15. [Maintenance and Updates](#maintenance-and-updates)
16. [Troubleshooting](#troubleshooting)

---

## Deployment Overview

### Architecture

```
Internet
    ↓
Domain (yourdomain.com)
    ↓
SSL/TLS (Let's Encrypt)
    ↓
Nginx Reverse Proxy
    ↓
┌─────────────┬─────────────────┬──────────────────┐
│   Backend   │   POS Frontend  │  E-commerce      │
│   (Port     │   (Port 3001)   │  Frontend        │
│    3000)    │                 │  (Port 3002)     │
└─────────────┴─────────────────┴──────────────────┘
         ↓
   Supabase PostgreSQL Database
```

### Deployment Options

- **Option 1**: Single VPS (Recommended for small to medium businesses)
- **Option 2**: Separate servers for backend and frontends
- **Option 3**: Cloud platforms (AWS, Google Cloud, Azure)

This guide focuses on Option 1 using a Linux VPS.

---

## Server Requirements

### Minimum Specifications

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 40GB SSD
- **OS**: Ubuntu 20.04 LTS or later
- **Network**: 100Mbps connection

### Recommended Specifications

- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 80GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Network**: 1Gbps connection

### Supported VPS Providers

- DigitalOcean (recommended)
- Linode
- Vultr
- AWS EC2
- Google Cloud Compute Engine

---

## Pre-Deployment Checklist

Before deploying to production:

### Code and Configuration

- [ ] All features tested in development
- [ ] Environment variables reviewed and secured
- [ ] Default passwords changed
- [ ] JWT_SECRET generated with secure random string
- [ ] Database migrations tested
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] SSL certificates obtained

### Security

- [ ] Firewall configured
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] Fail2ban installed
- [ ] Security updates enabled
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled

### Monitoring

- [ ] PM2 configured
- [ ] Log rotation enabled
- [ ] Monitoring tools set up
- [ ] Backup strategy in place
- [ ] Alert notifications configured

---

## Domain and SSL Setup

### Step 1: Purchase Domain

Purchase a domain from providers like:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

### Step 2: Configure DNS

Add DNS records pointing to your server IP:

```
Type    Name    Value           TTL
A       @       YOUR_SERVER_IP  3600
A       www     YOUR_SERVER_IP  3600
A       api     YOUR_SERVER_IP  3600
A       shop    YOUR_SERVER_IP  3600
```

Example configuration:
- `yourdomain.com` → POS Frontend
- `api.yourdomain.com` → Backend API
- `shop.yourdomain.com` → E-commerce Frontend

### Step 3: Wait for DNS Propagation

DNS changes can take 1-48 hours to propagate worldwide.

Check propagation: https://www.whatsmydns.net/

---

## Server Setup

### Step 1: Connect to Server

```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Update System

```bash
apt update && apt upgrade -y
```

### Step 3: Create Non-Root User

```bash
# Create user
adduser vcare

# Add to sudo group
usermod -aG sudo vcare

# Switch to new user
su - vcare
```

### Step 4: Configure SSH Key Authentication

On your local machine:

```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy key to server
ssh-copy-id vcare@YOUR_SERVER_IP
```

### Step 5: Secure SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Update these settings:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

### Step 6: Configure Firewall

```bash
# Install UFW
sudo apt install ufw -y

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 7: Install Node.js

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 8: Install PM2 Globally

```bash
sudo npm install -g pm2
```

### Step 9: Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Database Configuration

### Use Supabase (Recommended)

Supabase handles database hosting, backups, and scaling:

1. Keep your Supabase production project separate from development
2. Use connection pooling for better performance
3. Enable Point-in-Time Recovery (PITR) for backups
4. Whitelist your server IP in Supabase settings

### Database Security

```sql
-- In Supabase SQL Editor, ensure secure configurations
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET max_connections = 100;
```

---

## Backend Deployment

### Step 1: Clone Repository

```bash
cd /home/vcare
git clone <repository-url> vcare-pos-system
cd vcare-pos-system/backend
```

### Step 2: Install Dependencies

```bash
npm install --production
```

### Step 3: Configure Environment

```bash
nano .env
```

Add production environment variables:

```env
# Database Configuration (Supabase Production)
DB_HOST=db.YOUR_PROJECT.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_production_password

# JWT Authentication (Generate new secret!)
JWT_SECRET=your_production_jwt_secret_minimum_32_characters

# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PASSWORD=your_app_password
MAIL_EMAIL=your_email@gmail.com
MAIL_PORT=465

# Application URL (Your production domain)
APP_URL=https://api.yourdomain.com
```

### Step 4: Initialize Database

```bash
node src/init-db.js
```

### Step 5: Start with PM2

```bash
pm2 start src/index.js --name vcare-backend
pm2 save
pm2 startup
```

### Step 6: Verify Backend

```bash
curl http://localhost:3000/api/system/health
```

---

## Frontend Deployment

### POS Frontend

#### Step 1: Navigate to Project Root

```bash
cd /home/vcare/vcare-pos-system
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment

```bash
nano .env
```

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BARCODE_SCANNER_ENABLED=true
VITE_BARCODE_END_KEYS=Enter,Tab
VITE_BARCODE_MIN_LENGTH=4
VITE_BARCODE_TIMEOUT_MS=80
```

#### Step 4: Build

```bash
npm run build
```

#### Step 5: Serve with PM2

```bash
pm2 start "npx serve -s dist -p 3001" --name vcare-pos-frontend
pm2 save
```

### E-commerce Frontend

#### Step 1: Navigate to E-commerce Directory

```bash
cd /home/vcare/vcare-pos-system/ecommerce-frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment

```bash
nano .env
```

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Step 4: Build

```bash
npm run build
```

#### Step 5: Serve with PM2

```bash
pm2 start "npx serve -s dist -p 3002" --name vcare-ecommerce-frontend
pm2 save
```

---

## PM2 Process Management

### View All Processes

```bash
pm2 list
```

### Monitor Processes

```bash
pm2 monit
```

### View Logs

```bash
# All logs
pm2 logs

# Specific process
pm2 logs vcare-backend
pm2 logs vcare-pos-frontend
pm2 logs vcare-ecommerce-frontend
```

### Restart Processes

```bash
# Restart all
pm2 restart all

# Restart specific
pm2 restart vcare-backend
```

### Stop Processes

```bash
pm2 stop all
pm2 stop vcare-backend
```

### Auto-Start on Reboot

```bash
pm2 startup systemd
pm2 save
```

---

## Nginx Reverse Proxy

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/vcare-pos
```

### Step 2: Add Configuration

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# POS Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# E-commerce Frontend
server {
    listen 80;
    server_name shop.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 3: Enable Configuration

```bash
sudo ln -s /etc/nginx/sites-available/vcare-pos /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL/HTTPS Configuration

### Step 1: Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Obtain SSL Certificates

```bash
# For all domains at once
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d shop.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### Step 3: Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

### Step 4: Verify HTTPS

Visit your domains:
- https://yourdomain.com
- https://api.yourdomain.com
- https://shop.yourdomain.com

All should show a secure padlock icon.

---

## Environment Variables

### Production Environment Variables Checklist

#### Backend

- [ ] `DB_HOST` - Production Supabase host
- [ ] `DB_PASSWORD` - Strong database password
- [ ] `JWT_SECRET` - New random 32+ character string
- [ ] `NODE_ENV=production`
- [ ] `LOG_LEVEL=info` (not debug)
- [ ] `APP_URL` - Production domain with HTTPS

#### Frontends

- [ ] `VITE_API_URL` - Production API URL with HTTPS
- [ ] `VITE_SUPABASE_URL` - Production Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Production anon key

### Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique passwords** for production
3. **Rotate secrets regularly** (every 90 days)
4. **Limit access** to environment variables
5. **Use environment-specific values** (don't reuse dev credentials)

---

## Monitoring and Logging

### PM2 Monitoring

```bash
# Enable PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Application Logs

Logs are stored in:
- Backend: `/home/vcare/vcare-pos-system/backend/logs/`
- PM2 Logs: `~/.pm2/logs/`

### Log Rotation

```bash
sudo nano /etc/logrotate.d/vcare-pos
```

```
/home/vcare/vcare-pos-system/backend/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 vcare vcare
    sharedscripts
}
```

### System Monitoring

Install monitoring tools:

```bash
# Install htop
sudo apt install htop -y

# Install netdata (optional)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

---

## Backup Strategy

### Database Backups

Supabase provides automated backups:
- **Daily backups** (retained for 7 days on free plan)
- **Point-in-Time Recovery** (available on paid plans)

Manual backup:

```bash
# Create backup script
nano ~/backup-database.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/vcare/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup via pg_dump through Supabase
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U postgres -d postgres > $BACKUP_DIR/vcare_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "vcare_*.sql" -mtime +7 -delete

echo "Backup completed: vcare_$DATE.sql"
```

```bash
chmod +x ~/backup-database.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

```
0 2 * * * /home/vcare/backup-database.sh >> /home/vcare/backup.log 2>&1
```

### Application Backups

```bash
# Backup application files weekly
0 3 * * 0 tar -czf /home/vcare/backups/app_$(date +\%Y\%m\%d).tar.gz /home/vcare/vcare-pos-system
```

---

## Maintenance and Updates

### Zero-Downtime Deployment

```bash
cd /home/vcare/vcare-pos-system

# Pull latest changes
git pull origin main

# Backend update
cd backend
npm install --production
pm2 reload vcare-backend

# POS Frontend update
cd ..
npm install
npm run build
pm2 reload vcare-pos-frontend

# E-commerce Frontend update
cd ecommerce-frontend
npm install
npm run build
pm2 reload vcare-ecommerce-frontend
```

### System Updates

```bash
# Weekly security updates
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
sudo reboot
```

### Node.js Updates

```bash
# Update to latest LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Restart all services
pm2 restart all
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check PM2 logs
pm2 logs vcare-backend --lines 50

# Check if port is in use
sudo lsof -i :3000

# Check process status
pm2 status
```

### SSL Certificate Issues

```bash
# Renew certificates manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

### High Memory Usage

```bash
# Check memory
free -h
pm2 monit

# Restart specific process
pm2 restart vcare-backend

# Add memory limit to PM2
pm2 restart vcare-backend --max-memory-restart 500M
```

### Database Connection Issues

```bash
# Test database connection
cd /home/vcare/vcare-pos-system/backend
node -e "require('./src/utils/db').pool.query('SELECT NOW()', (err, res) => { console.log(err ? err : res.rows); process.exit(); })"

# Check Supabase status
# Visit https://status.supabase.com/
```

### Nginx Configuration Errors

```bash
# Test Nginx configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

---

## Performance Optimization

### Enable Gzip Compression

```bash
sudo nano /etc/nginx/nginx.conf
```

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### PM2 Cluster Mode

For better performance, run backend in cluster mode:

```bash
pm2 start src/index.js -i max --name vcare-backend-cluster
```

### Database Connection Pooling

Use Supabase connection pooling for better performance.

---

## Security Checklist

Before going live:

- [ ] SSL/HTTPS enabled on all domains
- [ ] Firewall configured and enabled
- [ ] SSH password authentication disabled
- [ ] Strong database passwords
- [ ] JWT_SECRET is production-specific
- [ ] NODE_ENV=production
- [ ] All default passwords changed
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers configured in Nginx
- [ ] Fail2ban installed and configured
- [ ] Regular backup schedule
- [ ] Monitoring and alerts set up

---

## Post-Deployment Verification

- [ ] All three services accessible via HTTPS
- [ ] SSL certificates valid (no browser warnings)
- [ ] POS login works
- [ ] E-commerce registration and login work
- [ ] Products load correctly
- [ ] Transactions can be created
- [ ] E-commerce orders can be placed
- [ ] Email notifications working
- [ ] PM2 processes auto-start after reboot
- [ ] Logs rotating properly
- [ ] Backups running on schedule

---

## Support and Resources

- [Main Documentation](README.md)
- [Setup Guide](SETUP.md)
- [Features Documentation](FEATURES.md)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Supabase Documentation](https://supabase.com/docs)

---

## Congratulations!

Your VCare POS System is now deployed to production and ready for business!

Remember to:
- Monitor logs regularly
- Keep backups current
- Update regularly
- Review security practices
- Test new features in development first
