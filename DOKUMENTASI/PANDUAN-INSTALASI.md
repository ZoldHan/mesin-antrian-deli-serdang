# 🛠️ PANDUAN INSTALASI MESIN ANTRIAN

Panduan lengkap instalasi sistem antrian Disdukcapil Deli Serdang.

---

## 📋 PRASYARAT

### **Spesifikasi Minimum Server:**

| Komponen | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 Core | 2 Core |
| RAM | 512 MB | 1 GB |
| Storage | 5 GB | 10 GB |
| OS | Ubuntu 18.04 / Windows 10 | Ubuntu 20.04 |
| Node.js | v16+ | v18+ LTS |
| MySQL | 5.7 | 8.0+ |

### **Software yang Harus Diinstall:**

1. **Node.js** - https://nodejs.org
2. **MySQL/MariaDB** - `sudo apt install mysql-server`
3. **Git** - `sudo apt install git`

---

## 🚀 INSTALASI STEP-BY-STEP

### **STEP 1: Clone/Download Source Code**

```bash
# Jika pakai Git
cd /var/www
git clone [repository-url] mesin-antrian

# Atau extract ZIP
cd /var/www
unzip mesin-antrian.zip
cd mesin-antrian
```

### **STEP 2: Install Dependencies**

```bash
cd /var/www/mesin-antrian
npm install
```

**Output yang diharapkan:**
```
added 147 packages, and audited 148 packages in 12s
26 packages are looking for funding
```

### **STEP 3: Setup Database**

```bash
# Login ke MySQL
mysql -u root -p
# Masukkan password root MySQL
```

```sql
-- Buat database
CREATE DATABASE antrian_disdukcapil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user khusus (optional, untuk keamanan)
CREATE USER 'antrian_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON antrian_disdukcapil.* TO 'antrian_user'@'localhost';
FLUSH PRIVILEGES;

-- Gunakan database
USE antrian_disdukcapil;

-- Import schema
source /var/www/mesin-antrian/database/schema.sql;

-- Verifikasi
SHOW TABLES;
-- Harusnya muncul: antrian, users, log_aktivitas

-- Exit
EXIT;
```

### **STEP 4: Konfigurasi Environment**

```bash
# Copy template
cp .env.example .env

# Edit konfigurasi
nano .env
# Atau pakai text editor lain: vim, vi, notepad++
```

**Isi file .env:**

```env
# Database Configuration
DB_HOST=localhost
DB_USER=antrian_user
DB_PASSWORD=StrongPassword123!
DB_NAME=antrian_disdukcapil

# SMS Gateway (Fonnte)
SMS_API_URL=https://api.fonnte.com/send
SMS_API_KEY=your_fonnte_token_here

# App Configuration
APP_PORT=3000
APP_URL=http://localhost:3000
```

**📝 Cara Dapat SMS API Key:**

1. Buka https://fonnte.com
2. Klik "Daftar" → Isi form
3. Beli paket (minimal Rp 50rb = 100 SMS)
4. Login → Dashboard → API Token
5. Copy token → Paste ke `.env`

**Alternatif SMS Gateway:**
- **Wablas** (WhatsApp): https://wablas.com (Rp 300/pesan)
- **Twilio**: https://twilio.com ($0.0075/SMS)
- **Zenziva**: https://zenziva.net (Rp 350/SMS)

### **STEP 5: Test Database Connection**

```bash
# Buat file test
nano test-db.js
```

```javascript
// test-db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Database connected!');
    await conn.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

test();
```

```bash
# Jalankan test
node test-db.js
```

**Output sukses:**
```
✅ Database connected!
```

### **STEP 6: Run Server (Development)**

```bash
npm start
```

**Output yang diharapkan:**
```
> antrian-disdukcapil@1.0.0 start
> node server.js

Server running on port 3000
API URL: http://localhost:3000/api
```

**Test akses:**
- Browser: http://localhost:3000
- API: http://localhost:3000/api/dashboard

### **STEP 7: Run Server (Production)**

**Opsi A: Pakai PM2 (Recommended)**

```bash
# Install PM2 global
npm install -g pm2

# Start aplikasi
pm2 start server.js --name mesin-antrian

# Auto-start on boot
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs mesin-antrian
```

**Opsi B: Pakai Systemd**

```bash
# Buat service file
sudo nano /etc/systemd/system/mesin-antrian.service
```

```ini
[Unit]
Description=Mesin Antrian Disdukcapil
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mesin-antrian
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Enable & start
sudo systemctl daemon-reload
sudo systemctl enable mesin-antrian
sudo systemctl start mesin-antrian
sudo systemctl status mesin-antrian
```

### **STEP 8: Setup HTTPS (Optional tapi Recommended)**

**Pakai Let's Encrypt (Gratis):**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Dapatkan sertifikat
sudo certbot --nginx -d antrian.deliserdangkab.go.id

# Auto-renewal
sudo certbot renew --dry-run
```

**Atau pakai Cloudflare Tunnel (Lebih Mudah):**

```bash
# Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Run tunnel
cloudflared tunnel --url http://localhost:3000
```

---

## 🔧 KONFIGURASI LANJUTAN

### **A. Reverse Proxy (Nginx)**

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/mesin-antrian
```

```nginx
server {
    listen 80;
    server_name antrian.deliserdangkab.go.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mesin-antrian /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **B. Backup Database Otomatis**

```bash
# Buat script backup
nano /var/www/mesin-antrian/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/antrian"
mkdir -p $BACKUP_DIR

mysqldump -u antrian_user -p'StrongPassword123!' antrian_disdukcapil > $BACKUP_DIR/backup_$DATE.sql

# Delete backup lama (>7 hari)
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
# Cronjob (backup setiap hari jam 23:00)
crontab -e
# Tambahkan:
0 23 * * * /var/www/mesin-antrian/backup.sh
```

### **C. Monitoring dengan Uptime Kuma**

```bash
# Install Uptime Kuma (Docker)
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data louislam/uptime-kuma:1

# Akses: http://localhost:3001
# Add monitoring: http://localhost:3000/api/dashboard
```

---

## ❗ TROUBLESHOOTING

### **Error: "Cannot find module 'mysql2'"**

```bash
# Solusi: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **Error: "Database connection refused"**

```bash
# Cek MySQL running
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Cek user & password
mysql -u antrian_user -p
```

### **Error: "Port 3000 already in use"**

```bash
# Cari proses yang pakai port 3000
lsof -i :3000

# Kill proses
kill -9 [PID]

# Atau ganti port di .env
APP_PORT=3001
```

### **Error: "SMS failed to send"**

```bash
# Cek API key di .env
nano .env

# Test manual dengan curl
curl -X POST https://api.fonnte.com/send \
  -H "Authorization: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target":"081234567890","message":"Test"}'
```

### **Server Crash/Mati**

```bash
# Cek log PM2
pm2 logs mesin-antrian

# Restart
pm2 restart mesin-antrian

# Cek resource
htop
df -h
```

---

## 📊 TESTING

### **Test 1: Homepage**

```bash
curl http://localhost:3000
# Harus return HTML homepage
```

### **Test 2: API Dashboard**

```bash
curl http://localhost:3000/api/dashboard
# Harus return JSON: {"success":true,"data":{...}}
```

### **Test 3: Daftar Antrian**

```bash
curl -X POST http://localhost:3000/api/antrian/daftar \
  -H "Content-Type: application/json" \
  -d '{"nik":"1234567890123456","nama":"Test User","no_hp":"081234567890","layanan":"KTP-El"}'
```

### **Test 4: Load Testing**

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:3000/api/dashboard
```

---

## ✅ CHECKLIST INSTALASI

```
□ Node.js installed (node -v)
□ MySQL installed (mysql --version)
□ Source code downloaded
□ Dependencies installed (npm install)
□ Database created
□ Schema imported
□ .env configured
□ SMS API key added
□ Server running (npm start)
□ Homepage accessible
□ Admin panel accessible
□ SMS test sent successfully
□ Backup script configured
□ Monitoring setup
□ HTTPS enabled (optional)
```

---

## 📞 SUPPORT

Jika ada masalah saat instalasi:

1. **Cek log:** `tail -f /var/log/mesin-antrian/error.log`
2. **Cek dokumentasi:** Lihat file TROUBLESHOOTING.md
3. **Kontak tim:** [email/telepon support]

---

**© 2026 Disdukcapil Kabupaten Deli Serdang**

**Versi:** 1.0.0
**Last Updated:** 14 Mei 2026
