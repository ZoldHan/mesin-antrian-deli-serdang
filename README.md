# 🎫 Sistem Antrian Online Disdukcapil Deli Serdang

Sistem antrian berbasis web dengan notifikasi SMS untuk pelayanan Disdukcapil.

---

## 📋 Fitur

✅ Antrian online via web
✅ Notifikasi SMS otomatis
✅ Dashboard real-time
✅ Panel admin untuk loket
✅ Responsive (mobile-friendly)

---

## 🚀 Instalasi

### 1. Install Dependencies
```bash
cd /mnt/data/openclaw/workspace/.openclaw/workspace/disdukcapil-antrian
npm install
```

### 2. Setup Database
```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE antrian_disdukcapil;
USE antrian_disdukcapil;

# Import schema
source database/schema.sql;
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env  # Edit sesuai konfigurasi
```

**Isi .env:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=antrian_disdukcapil

SMS_API_URL=https://api.fonnte.com/send
SMS_API_KEY=your_fonnte_token  # Daftar di https://fonnte.com

APP_PORT=3000
APP_URL=http://localhost:3000
```

### 4. Run Server
```bash
npm start
```

Server akan berjalan di: **http://localhost:3000**

---

## 📱 SMS Gateway Options

### Opsi 1: Fonnte (Recommended)
- Website: https://fonnte.com
- Harga: Rp 500/SMS
- Setup: Beli token → Dapat API key → Isi di .env

### Opsi 2: Wablas (WhatsApp)
- Website: https://wablas.com
- Harga: Rp 300/pesan WA
- Kelebihan: Via WhatsApp (lebih murah)

### Opsi 3: Twilio (International)
- Website: https://twilio.com
- Harga: $0.0075/SMS (~Rp 120)
- Kelebihan: Reliable, international

---

## 🖥️ Panel Admin (Loket)

Akses: **http://localhost:3000/admin**

**Fitur Admin:**
- Lihat daftar antrian hari ini
- Panggil antrian per loket
- Tandai antrian selesai
- Export laporan harian

---

## 📊 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/antrian/tersedia` | Cek kuota antrian |
| POST | `/api/antrian/daftar` | Daftar antrian baru |
| GET | `/api/antrian/status/:no_hp` | Cek status antrian |
| POST | `/api/antrian/panggil` | Panggil antrian (admin) |
| POST | `/api/antrian/selesai` | Tandai selesai (admin) |
| GET | `/api/dashboard` | Statistik hari ini |

---

## 🎯 Implementasi di Disdukcapil

### Opsi A: Server Lokal Dinas
- Install di server existing
- Akses via LAN: `http://192.168.x.x:3000`
- QR code di lobby untuk akses

### Opsi B: Hosting Cloud
- VPS: Rp 50rb/bulan (DigitalOcean, Linode)
- Domain: `antrian.deliserdangkab.go.id`
- SSL: Let's Encrypt (gratis)

### Opsi C: Hybrid
- Frontend: Hosting gratis (Vercel, Netlify)
- Backend: Server lokal Dinas
- Database: Server lokal

---

## 📈 Monitoring & Evaluasi

**KPI yang diukur:**
- Rata-rata waktu tunggu (target: <30 menit)
- Kepuasan masyarakat (survey)
- Jumlah antrian/hari
- Persentase no-show

**Laporan Bulanan:**
- Export Excel dari database
- Grafik tren antrian
- Analisis peak hours

---

## 🔒 Keamanan

- Password admin di-hash (bcrypt)
- Input validation (SQL injection prevention)
- Rate limiting API
- CORS enabled
- HTTPS recommended

---

## 📞 Support

Untuk bantuan implementasi:
- Email: [your-email@deliserdangkab.go.id](mailto:your-email@deliserdangkab.go.id)
- Telp: [your-phone]

---

**© 2026 Disdukcapil Kabupaten Deli Serdang**
