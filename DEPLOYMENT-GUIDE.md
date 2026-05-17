# 🚀 PANDUAN DEPLOYMENT - MESIN ANTRIAN

**Disdukcapil Kabupaten Deli Serdang**  
*Versi: 2.0 - Mei 2026*

---

## 📋 **DAFTAR ISI**

1. [Persiapan Server](#1-persiapan-server)
2. [Instalasi Dependencies](#2-instalasi-dependencies)
3. [Setup Database](#3-setup-database)
4. [Konfigurasi Aplikasi](#4-konfigurasi-aplikasi)
5. [Setup Public Access](#5-setup-public-access)
6. [SSL/HTTPS Setup](#6-sslhttps-setup)
7. [Auto-Start Service](#7-auto-start-service)
8. [Testing & Monitoring](#8-testing--monitoring)

---

## 1. **PERSIAPAN SERVER**

### **Spesifikasi Minimum:**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 Core | 4 Core |
| **RAM** | 2 GB | 4 GB |
| **Storage** | 20 GB | 40 GB SSD |
| **OS** | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |
| **Network** | 10 Mbps | 50 Mbps |

### **Pilihan Server:**

#### **Option A: Server Lokal (Kantor Disdukcapil)**
- ✅ Data tetap di kantor (lebih aman)
- ✅ Kontrol penuh
- ❌ Butuh IP public & port forwarding
- ❌ Tergantung uptime listrik & internet kantor

#### **Option B: Cloud VPS**
- ✅ Selalu online (99.9% uptime)
- ✅ IP public sudah include
- ✅ Scalable
- ❌ Biaya bulanan (~Rp 100-300rb/bulan)

**Rekomendasi VPS Indonesia:**
- **Niagahoster** - Cloud VPS dari Rp 150rb/bulan
- **IDCloudHost** - Cloud VPS dari Rp 120rb/bulan
- **Biznet Gio** - Cloud VPS dari Rp 200rb/bulan
- **DigitalOcean** - $5/month (~Rp 75rb)

---

## 2. **INSTALASI DEPENDENCIES**

### **Step 1: Update System**

```bash
sudo apt update && sudo apt upgrade -y
```

### **Step 2: Install Node.js**

```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### **Step 3: Install MySQL**

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
```

**Saat ditanya:**
```
VALIDATE PASSWORD COMPONENT? → No (tekan 'n')
Change root password? → No (tekan 'n')
Remove anonymous users? → Yes (tekan 'y')
Disallow root login remotely? → Yes (tekan 'y')
Remove test database? → Yes (tekan 'y')
Reload privilege tables? → Yes (tekan 'y')
```

### **Step 4: Install Git**

```bash
sudo apt install -y git
```

### **Step 5: Install PM2 (Process Manager)**

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
# Copy-paste command yang muncul di terminal
```

---

## 3. **SETUP DATABASE**

### **Step 1: Login ke MySQL**

```bash
sudo mysql -u root -p
```

### **Step 2: Buat Database & User**

```sql
-- Buat database
CREATE DATABASE antrian_disdukcapil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user khusus untuk aplikasi
CREATE USER 'antrian_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON antrian_disdukcapil.* TO 'antrian_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### **Step 3: Import Schema**

```bash
# Clone atau upload source code ke server
cd /var/www

# Jika dari GitHub
sudo git clone https://github.com/ZoldHan/mesin-antrian-deli-serdang.git
cd mesin-antrian-deli-serdang

# Import schema
sudo mysql -u antrian_user -p antrian_disdukcapil < database/schema.sql
```

**Verifikasi:**
```bash
mysql -u antrian_user -p antrian_disdukcapil -e "SHOW TABLES;"
```

---

## 4. **KONFIGURASI APLIKASI**

### **Step 1: Install Dependencies**

```bash
cd /var/www/mesin-antrian-deli-serdang
npm install
```

### **Step 2: Buat File .env**

```bash
cp .env.example .env
nano .env
```

**Isi file `.env`:**

```env
# Database Configuration
DB_HOST=localhost
DB_USER=antrian_user
DB_PASSWORD=YourSecurePassword123!
DB_NAME=antrian_disdukcapil

# Server Configuration
PORT=3000
NODE_ENV=production

# SMS Gateway (Fonnte)
FONNTE_URL=https://api.fonnte.com/send
FONNTE_TOKEN=YOUR_FONNTE_TOKEN_HERE

# Application
APP_NAME=Antrian Disdukcapil Deli Serdang
APP_URL=https://antrian.deliserdangkab.go.id
```

**Save:** `Ctrl+X` → `Y` → `Enter`

### **Step 3: Test Run**

```bash
# Test manual
node server.js

# Should show:
# Server running on port 3000
# API URL: http://localhost:3000/api
```

**Test API:**
```bash
curl http://localhost:3000/api/antrian/tersedia
```

**Expected response:**
```json
{"success":true,"tersedia":100,"kuota":100}
```

**Stop:** `Ctrl+C`

---

## 5. **SETUP PUBLIC ACCESS**

### **Option A: Port Forwarding (Server Lokal)**

#### **Step 1: Cek IP Public Kantor**

```bash
curl ifconfig.me
# Example: 103.123.45.67
```

#### **Step 2: Setup Port Forwarding di Router**

1. **Login ke Router** (biasanya `192.168.1.1` atau `192.168.0.1`)
2. **Cari menu:** Port Forwarding / Virtual Server / NAT
3. **Add new rule:**

| Field | Value |
|-------|-------|
| **Service Name** | Antrian-Web |
| **External Port** | 80 (HTTP) & 443 (HTTPS) |
| **Internal IP** | 192.168.1.100 (IP server lokal) |
| **Internal Port** | 3000 |
| **Protocol** | TCP |

4. **Save & Apply**

#### **Step 3: Test dari Luar**

Dari HP (gunakan data seluler, bukan WiFi kantor):

```
http://103.123.45.67
```

---

### **Option B: Reverse Proxy dengan Nginx (RECOMMENDED)**

#### **Step 1: Install Nginx**

```bash
sudo apt install -y nginx
```

#### **Step 2: Buat Config Nginx**

```bash
sudo nano /etc/nginx/sites-available/antrian
```

**Isi config:**

```nginx
server {
    listen 80;
    server_name antrian.deliserdangkab.go.id;  # Ganti dengan domain/subdomain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### **Step 3: Enable Site**

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/antrian /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### **Step 4: Setup Firewall**

```bash
# Install UFW if not exists
sudo apt install -y ufw

# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 6. **SSL/HTTPS SETUP**

### **Step 1: Install Certbot**

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### **Step 2: Get SSL Certificate**

```bash
sudo certbot --nginx -d antrian.deliserdangkab.go.id
```

**Follow prompts:**
- Enter email: `admin@deliserdangkab.go.id`
- Agree to TOS: `A` (Agree)
- Share email with EFF: `N` (No)

### **Step 3: Auto-Renewal Test**

```bash
# Test renewal
sudo certbot renew --dry-run
```

**Certbot akan auto-renew setiap 90 hari**

### **Step 4: Verify HTTPS**

```bash
curl -I https://antrian.deliserdangkab.go.id
```

Should show:
```
HTTP/2 200
...
```

---

## 7. **AUTO-START SERVICE**

### **Step 1: Start App dengan PM2**

```bash
cd /var/www/mesin-antrian-deli-serdang

# Start app
pm2 start server.js --name "antrian-app"

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

**Copy-paste command yang muncul, example:**
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### **Step 2: Verify**

```bash
# Check status
pm2 status

# Should show:
# ┌────┬─────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
# │ Id │ Name        │ Mode     │ ↺    │ Status    │ CPU      │ Memory   │
# ├────┼─────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
# │ 0  │ antrian-app │ fork     │ 0    │ online    │ 0%       │ 50.2mb   │
# └────┴─────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

### **Step 3: PM2 Commands**

```bash
# View logs
pm2 logs antrian-app

# Restart app
pm2 restart antrian-app

# Stop app
pm2 stop antrian-app

# View detailed info
pm2 show antrian-app

# Monitor in real-time
pm2 monit
```

---

## 8. **TESTING & MONITORING**

### **Test 1: Local Access**

```bash
curl http://localhost:3000
```

### **Test 2: Public Access**

Dari browser (HP/laptop di luar kantor):

```
https://antrian.deliserdangkab.go.id
```

### **Test 3: API Endpoint**

```bash
curl https://antrian.deliserdangkab.go.id/api/antrian/tersedia
```

### **Test 4: Submit Antrian**

```bash
curl -X POST https://antrian.deliserdangkab.go.id/api/antrian/daftar \
  -H "Content-Type: application/json" \
  -d '{
    "nik": "1234567890123456",
    "nama": "Test User",
    "no_hp": "081234567890",
    "layanan": "Cetak KTP"
  }'
```

### **Test 5: SMS Gateway**

1. Daftar antrian dengan nomor HP asli
2. Cek SMS masuk
3. Jika tidak masuk, check log:

```bash
pm2 logs antrian-app | grep SMS
```

---

## 📊 **MONITORING SETUP**

### **Option 1: PM2 Monitor**

```bash
# Real-time monitoring
pm2 monit
```

### **Option 2: Setup Uptime Monitoring**

**UptimeRobot (Free):**
1. Daftar di https://uptimerobot.com
2. Add new monitor:
   - **Type:** HTTPS
   - **URL:** https://antrian.deliserdangkab.go.id
   - **Interval:** 5 minutes
3. Get email alert jika down

### **Option 3: Log Rotation**

```bash
# PM2 auto log rotation
pm2 install pm2-logrotate

# Set max size
pm2 set pm2-logrotate:max_size 10M

# Set retention
pm2 set pm2-logrotate:retain 7
```

---

## 🔒 **SECURITY CHECKLIST**

- [x] Firewall enabled (UFW)
- [x] Only necessary ports open (22, 80, 443)
- [x] MySQL user dengan password kuat
- [x] `.env` file dengan permissions ketat
- [x] SSL/HTTPS enabled
- [x] Regular system updates
- [x] Backup database otomatis

### **Setup Database Backup:**

```bash
# Create backup script
sudo nano /usr/local/bin/backup-antrian.sh
```

**Isi script:**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/antrian"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u antrian_user -p'YourSecurePassword123!' antrian_disdukcapil > $BACKUP_DIR/backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

**Make executable:**

```bash
sudo chmod +x /usr/local/bin/backup-antrian.sh
```

**Add to crontab:**

```bash
sudo crontab -e
```

**Add line:**

```
0 2 * * * /usr/local/bin/backup-antrian.sh
```

(Backup setiap jam 2 pagi)

---

## 📱 **SETUP SMS GATEWAY (FONNTE)**

### **Step 1: Beli Token**

1. Kunjungi https://fonnte.com
2. Pilih paket (minimal Rp 50.000 = 100 SMS)
3. Register & login
4. Get API token

### **Step 2: Update .env**

```bash
nano .env
```

**Update line:**

```env
FONNTE_TOKEN=your_token_here
```

### **Step 3: Test SMS**

```bash
curl -X POST https://api.fonnte.com/send \
  -H "Authorization: your_token_here" \
  -d "target=081234567890&message=Test SMS dari Antrian Disdukcapil"
```

---

## 🎯 **TROUBLESHOOTING**

### **Problem: "Cannot connect to database"**

```bash
# Check MySQL status
sudo systemctl status mysql

# Check credentials
cat .env | grep DB_

# Test connection
mysql -u antrian_user -p antrian_disdukcapil
```

### **Problem: "Port 3000 already in use"**

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### **Problem: "404 Not Found"**

```bash
# Check Nginx config
sudo nginx -t

# Check site enabled
ls -la /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl restart nginx
```

### **Problem: "502 Bad Gateway"**

```bash
# Check if app is running
pm2 status

# Restart app
pm2 restart antrian-app

# Check logs
pm2 logs antrian-app
```

### **Problem: "SSL certificate expired"**

```bash
# Manual renew
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📞 **SUPPORT CONTACTS**

**Technical Support:**
- Node.js: https://nodejs.org/docs
- MySQL: https://dev.mysql.com/doc
- Nginx: https://nginx.org/en/docs
- PM2: https://pm2.keymetrics.io/docs

**Local Support:**
- Disdukcapil IT Team: [Add contact]
- Developer: [Add contact]

---

## ✅ **DEPLOYMENT CHECKLIST**

### **Pre-Deployment:**
- [ ] Server ready (lokal/VPS)
- [ ] Domain/subdomain configured
- [ ] SSL certificate ready
- [ ] Database backup available

### **During Deployment:**
- [ ] Node.js installed
- [ ] MySQL installed
- [ ] Dependencies installed
- [ ] Database imported
- [ ] `.env` configured
- [ ] App tested locally

### **Post-Deployment:**
- [ ] Public access tested
- [ ] HTTPS working
- [ ] SMS gateway tested
- [ ] Backup script configured
- [ ] Monitoring setup
- [ ] Documentation updated

### **Go Live:**
- [ ] Final testing with real users
- [ ] Staff training completed
- [ ] User manual distributed
- [ ] Support channel ready

---

## 🎉 **DEPLOYMENT COMPLETE!**

**Aplikasi sekarang bisa diakses dari mana saja!**

**URL Public:**
- Homepage: https://antrian.deliserdangkab.go.id
- Admin: https://antrian.deliserdangkab.go.id/admin.html

**Next Steps:**
1. Sosialisasi ke masyarakat
2. Training staff Disdukcapil
3. Monitoring & maintenance rutin
4. Collect feedback untuk improvement

---

**Good luck! 🚀**
