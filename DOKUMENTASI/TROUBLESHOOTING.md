# 🔧 TROUBLESHOOTING GUIDE

Solusi masalah umum pada sistem antrian.

---

## 🚨 MASALAH KRITIS

### **1. Server Mati Total**

**Gejala:**
- Website tidak bisa diakses
- Error: "This site can't be reached"
- Panel admin juga tidak bisa

**Penyebab:**
- Server crash
- Node.js process berhenti
- Port conflict

**Solusi:**

```bash
# 1. Cek status server
pm2 status
# atau
systemctl status mesin-antrian

# 2. Restart server
pm2 restart mesin-antrian
# atau
systemctl restart mesin-antrian

# 3. Cek log error
pm2 logs mesin-antrian
# atau
journalctl -u mesin-antrian -f

# 4. Cek port conflict
lsof -i :3000
netstat -tulpn | grep 3000

# 5. Jika ada proses lain, kill
kill -9 [PID]

# 6. Start ulang
npm start
```

**Pencegahan:**
- Setup auto-restart (PM2)
- Monitoring uptime (Uptime Kuma)
- Backup server standby

---

### **2. Database Tidak Bisa Connect**

**Gejala:**
- Error: "Database connection refused"
- API return: 500 Internal Server Error
- Website loading terus

**Penyebab:**
- MySQL service mati
- Password salah
- User tidak punya akses
- Database corrupt

**Solusi:**

```bash
# 1. Cek MySQL running
sudo systemctl status mysql
sudo systemctl status mariadb

# 2. Restart MySQL
sudo systemctl restart mysql

# 3. Test koneksi manual
mysql -u antrian_user -p

# 4. Jika error "Access denied", reset password
mysql -u root -p
> ALTER USER 'antrian_user'@'localhost' IDENTIFIED BY 'new_password';
> FLUSH PRIVILEGES;
> EXIT;

# 5. Update .env dengan password baru
nano .env

# 6. Restart server
pm2 restart mesin-antrian
```

**Cek Database Corrupt:**

```sql
mysql -u root -p
USE antrian_disdukcapil;
CHECK TABLE antrian;
REPAIR TABLE antrian;
```

---

### **3. SMS Tidak Terkirim**

**Gejala:**
- Antrian berhasil tapi SMS tidak masuk
- Log error: "SMS failed"

**Penyebab:**
- API key expired/salah
- Kuota SMS habis
- Nomor HP format salah
- Server SMS down

**Solusi:**

```bash
# 1. Cek API key di .env
nano .env
# Pastikan SMS_API_KEY benar

# 2. Test manual dengan curl
curl -X POST https://api.fonnte.com/send \
  -H "Authorization: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"target":"6281234567890","message":"Test SMS"}'

# Response sukses:
# {"status":true,"message":"Success"}

# Response error:
# {"status":false,"message":"Invalid token"}
```

**Jika API key invalid:**
1. Login ke https://fonnte.com
2. Dashboard → API Token
3. Copy token baru
4. Update .env
5. Restart server

**Jika kuota habis:**
1. Login Fonnte
2. Beli paket (minimal Rp 50rb)
3. Token tetap sama, kuota nambah otomatis

**Format nomor HP:**
- ❌ Salah: 081234567890
- ✅ Benar: 6281234567890 (gunakan 62, bukan 0)

---

## ⚠️ MASALAH UMUM

### **4. Website Loading Lama**

**Gejala:**
- Halaman loading >10 detik
- Timeout error

**Penyebab:**
- Server overload
- Database query lambat
- Network issue

**Solusi:**

```bash
# 1. Cek resource server
htop
free -h
df -h

# 2. Cek slow query MySQL
mysql -u root -p
> SHOW PROCESSLIST;
> SHOW ENGINE INNODB STATUS;

# 3. Optimize database
mysqlcheck -u root -p --optimize --all-databases

# 4. Clear cache browser
# Ctrl+Shift+Delete (Chrome)

# 5. Enable caching di server
# Install Redis
sudo apt install redis-server
```

---

### **5. Antrian Ganda/Nomor Loncat**

**Gejala:**
- Nomor antrian sama untuk 2 orang
- Nomor loncat (A001, A003, A005)

**Penyebab:**
- Race condition (2 request bersamaan)
- Failed insert tapi nomor sudah ter-generate
- Database lock

**Solusi:**

```sql
-- 1. Cek antrian hari ini
SELECT * FROM antrian 
WHERE DATE(tanggal) = CURDATE() 
ORDER BY id DESC;

-- 2. Hapus duplikat (hati-hati!)
-- Backup dulu!
CREATE TABLE antrian_backup AS SELECT * FROM antrian;

-- 3. Reset auto-increment (jika perlu)
ALTER TABLE antrian AUTO_INCREMENT = 1;

-- 4. Update nomor antrian manual
SET @row_number = 0;
UPDATE antrian 
SET no_antrian = CONCAT('A', LPAD(@row_number:=@row_number+1, 3, '0'))
WHERE DATE(tanggal) = CURDATE()
ORDER BY id ASC;
```

**Pencegahan:**
- Gunakan database transaction
- Add unique constraint
- Implement queue system

---

### **6. Panel Admin Tidak Bisa Login**

**Gejala:**
- Error: "Invalid credentials"
- Redirect terus menerus

**Penyebab:**
- Password salah
- Session expired
- Cookie issue

**Solusi:**

```sql
-- 1. Reset password admin
mysql -u root -p
USE antrian_disdukcapil;

-- Generate new bcrypt hash (pakai online tool)
-- https://bcrypt-generator.com/
-- Password: admin123

UPDATE users 
SET password = '$2b$10$YourNewHashHere' 
WHERE username = 'admin';

FLUSH PRIVILEGES;
EXIT;
```

**Clear browser cache:**
- Chrome: Ctrl+Shift+Delete → Clear cookies
- Firefox: Ctrl+Shift+Delete → Clear data
- Atau coba Incognito mode

---

### **7. Laporan Tidak Muncul**

**Gejala:**
- Export Excel kosong
- Data tidak sesuai tanggal

**Penyebab:**
- Timezone salah
- Query date filter error
- Data memang tidak ada

**Solusi:**

```javascript
// 1. Cek timezone server
date
// Harus: WIB (UTC+7)

// 2. Set timezone di MySQL
mysql -u root -p
> SET GLOBAL time_zone = '+07:00';
> SET time_zone = '+07:00';

// 3. Update query di server.js
// Pastikan DATE(tanggal) sesuai timezone lokal
```

**Test query manual:**

```sql
SELECT * FROM antrian 
WHERE DATE(tanggal) BETWEEN '2026-05-01' AND '2026-05-14';
```

---

## 🐛 BUG & ERROR CODE

### **Error: "Cannot find module 'mysql2'"**

```bash
# Solusi: Reinstall dependencies
cd /var/www/mesin-antrian
rm -rf node_modules package-lock.json
npm install
```

### **Error: "Port 3000 already in use"**

```bash
# Cari proses
lsof -i :3000

# Kill
kill -9 [PID]

# Atau ganti port
nano .env
APP_PORT=3001
```

### **Error: "ER_ACCESS_DENIED_ERROR"**

```bash
# Reset MySQL user password
mysql -u root -p
> ALTER USER 'antrian_user'@'localhost' IDENTIFIED BY 'new_password';
> FLUSH PRIVILEGES;
```

### **Error: "ER_DUP_ENTRY"**

```sql
-- Ada duplikasi data
-- Cek
SELECT no_antrian, COUNT(*) 
FROM antrian 
GROUP BY no_antrian 
HAVING COUNT(*) > 1;

-- Hapus duplikat
DELETE t1 FROM antrian t1
INNER JOIN antrian t2 
WHERE t1.id > t2.id AND t1.no_antrian = t2.no_antrian;
```

### **Error: "ETIMEDOUT"**

```bash
# Network timeout
# Cek koneksi
ping google.com

# Cek DNS
nslookup antrian.deliserdangkab.go.id

# Restart network
sudo systemctl restart networking
```

---

## 📊 MONITORING & LOGS

### **Cek Log Server**

```bash
# PM2 logs
pm2 logs mesin-antrian --lines 100

# Systemd logs
journalctl -u mesin-antrian -f

# Custom log file
tail -f /var/log/mesin-antrian/error.log
```

### **Cek Database Log**

```bash
# MySQL error log
sudo tail -f /var/log/mysql/error.log

# Slow query log
sudo tail -f /var/log/mysql/mysql-slow.log
```

### **Monitoring Dashboard**

Install Uptime Kuma:

```bash
docker run -d --restart=always -p 3001:3001 louislam/uptime-kuma

# Akses: http://localhost:3001
# Add monitor: http://localhost:3000/api/dashboard
```

---

## 🆘 DARURAT

### **Server Down Total**

**Emergency procedure:**

1. **Aktifkan antrian manual**
   - Gunakan buku antrian fisik
   - Staff tetap layani seperti biasa

2. **Restart server**
   ```bash
   pm2 restart semua
   systemctl restart mysql
   ```

3. **Jika tidak bisa, rollback ke backup**
   ```bash
   # Restore database
   mysql -u root -p antrian_disdukcapil < /var/backups/antrian/backup_latest.sql
   ```

4. **Lapor atasan & tim IT**
   - Email: it@deliserdangkab.go.id
   - Telp: [nomor darurat]

### **Data Hilang/Corrupt**

**Recovery steps:**

1. **Stop semua write operation**
   ```bash
   pm2 stop mesin-antrian
   ```

2. **Restore dari backup terakhir**
   ```bash
   mysql -u root -p antrian_disdukcapil < /var/backups/antrian/backup_YYYYMMDD.sql
   ```

3. **Verifikasi data**
   ```sql
   SELECT COUNT(*) FROM antrian;
   SELECT MAX(tanggal) FROM antrian;
   ```

4. **Restart server**
   ```bash
   pm2 start mesin-antrian
   ```

---

## 📞 KONTAK SUPPORT

**Level 1 (Staff IT Lokal):**
- Ext: 123
- Email: it@deliserdangkab.go.id

**Level 2 (Developer):**
- Email: [developer email]
- Telp: [nomor developer]

**Level 3 (Vendor SMS):**
- Fonnte: support@fonnte.com
- Wablas: help@wablas.com

---

## ✅ CHECKLIST TROUBLESHOOTING

```
□ Identifikasi masalah (gejala apa?)
□ Cek log error
□ Cek resource server (CPU, RAM, Disk)
□ Cek koneksi database
□ Cek SMS gateway
□ Restart service
□ Test functionality
□ Dokumentasi solusi
□ Lapor ke tim
```

---

**© 2026 Disdukcapil Kabupaten Deli Serdang**

**Versi:** 1.0.0
**Last Updated:** 14 Mei 2026
