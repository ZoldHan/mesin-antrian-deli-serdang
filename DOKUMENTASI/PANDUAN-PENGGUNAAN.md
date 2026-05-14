# 📖 PANDUAN PENGGUNAAN MESIN ANTRIAN

Panduan lengkap untuk masyarakat dan staff Disdukcapil.

---

## 👥 BAGIAN 1: UNTUK MASYARAKAT

### **Cara Daftar Antrian Online**

#### **Langkah 1: Buka Website**

Buka browser (Chrome, Firefox, Safari) di HP atau laptop.

**URL:** `http://antrian.deliserdangkab.go.id`

Atau scan QR Code yang tersedia di lobby Disdukcapil.

#### **Langkah 2: Isi Form Pendaftaran**

Isi data berikut:

| Field | Keterangan | Contoh |
|-------|------------|--------|
| **NIK** | 16 digit sesuai KTP | 1234567890123456 |
| **Nama Lengkap** | Sesuai KTP | BUDI SANTOSO |
| **Nomor HP/WA** | Nomor aktif | 081234567890 |
| **Layanan** | Pilih jenis layanan | KTP-El |

**Tips:**
- Pastikan NIK benar (16 digit)
- Gunakan nomor HP yang aktif (untuk SMS)
- Nama sesuai KTP (huruf kapital semua)

#### **Langkah 3: Klik "Ambil Nomor Antrian"**

Setelah klik, Anda akan melihat:

```
✅ Antrian Berhasil!

Nomor Antrian: A025
Nama: BUDI SANTOSO
Layanan: KTP-El
Estimasi Waktu: 40 menit

SMS konfirmasi telah dikirim ke 081234567890
```

**Screenshot dan simpan nomor antrian!**

#### **Langkah 4: Tunggu SMS Notifikasi**

Anda akan menerima SMS:

```
[DISDUKCAPIL DELI SERDANG]
Antrian Berhasil! No: A025, Layanan: KTP-El.
Silakan datang ke kantor kami.
Jam operasional: 08:00-15:00 WIB.
Estimasi: 40 menit.
```

#### **Langkah 5: Datang ke Disdukcapil**

**Waktu kedatangan:**
- Datang **15 menit sebelum** estimasi waktu
- Tunjukkan nomor antrian ke security
- Menunggu di ruang tunggu

#### **Langkah 6: Ketika Dipanggil**

Anda akan menerima SMS:

```
[DISDUKCAPIL DELI SERDANG]
Antrian A025 a.n BUDI SANTOSO dipanggil ke loket 3.
Silakan segera menuju loket.
```

**Langsung ke loket yang ditunjuk!**

---

### **Cara Cek Status Antrian**

#### **Via Website:**

1. Buka halaman utama
2. Scroll ke bawah ke bagian "Cek Status Antrian"
3. Masukkan nomor HP
4. Klik "Cek"

**Hasil:**
```
No Antrian: A025
Status: DIPANGGIL
Layanan: KTP-El
Waktu Daftar: 14 Mei 2026, 09:15
```

#### **Via SMS:**

Ketik: `STATUS [NIK]` kirim ke `[nomor sistem]`

Contoh: `STATUS 1234567890123456`

Balasan:
```
A025 - DIPANGGIL - Loket 3
```

---

### **Pertanyaan Umum (FAQ)**

**Q: Apakah gratis?**
A: 100% GRATIS! Tidak dipungut biaya apapun.

**Q: Berapa lama antrian berlaku?**
A: Hanya berlaku di hari yang sama. Setelah 15:00, antrian hangus.

**Q: Bisa daftar untuk orang lain?**
A: Bisa! Gunakan NIK dan nama orang yang bersangkutan.

**Q: Kalau tidak punya HP?**
A: Tetap bisa antri manual di loket. Datang lebih pagi.

**Q: Berapa kuota per hari?**
A: 100 antrian untuk layanan KTP-El.

**Q: Kalau terlambat datang?**
A: Nomor antrian tetap berlaku, tapi Anda masuk antrian terakhir.

**Q: SMS tidak masuk?**
A: Cek sinyal, atau tanya staff untuk cek manual.

**Q: Bisa batal antrian?**
A: Bisa. Hubungi staff atau abaikan saja (akan auto-batal setelah jam 15:00).

---

## 👨‍💼 BAGIAN 2: UNTUK STAFF LOKET

### **Login ke Panel Admin**

**URL:** `http://antrian.deliserdangkab.go.id/admin.html`

**Default credentials:**
- Username: `admin`
- Password: `[lihat dengan atasan]`

**⚠️ PENTING:** Ganti password setelah login pertama!

---

### **Dashboard**

Setelah login, Anda melihat:

```
┌─────────────────────────────────────────┐
│  📊 Dashboard                           │
├─────────────────────────────────────────┤
│  Total Hari Ini: 45                     │
│  Menunggu: 12                           │
│  Dipanggil: 3                           │
│  Selesai: 30                            │
└─────────────────────────────────────────┘
```

**Refresh otomatis setiap 10 detik.**

---

### **Memanggil Antrian**

#### **Cara 1: Dari Daftar Antrian**

1. Klik menu "Antrian Hari Ini"
2. Cari nomor antrian yang ingin dipanggil
3. Klik tombol "📢 Panggil"
4. Pilih loket (1-4)
5. Klik "Konfirmasi Panggil"

**SMS otomatis terkirim ke masyarakat!**

#### **Cara 2: Dari Menu Panggil**

1. Klik menu "Panggil Antrian"
2. Lihat daftar "Antrian Menunggu"
3. Pilih loket (klik tombol Loket 1/2/3/4)
4. Klik "Panggil" di samping antrian
5. Konfirmasi

---

### **Menandai Antrian Selesai**

Setelah pelayanan selesai:

1. Cari antrian di tabel
2. Klik tombol "✅ Selesai"
3. Konfirmasi

**Status berubah: DIPANGGIL → SELESAI**

---

### **Membuat Laporan Harian**

1. Klik menu "Laporan"
2. Pilih tanggal mulai & akhir
3. Klik "Tampilkan"
4. Klik "Export Excel"

**File terdownload: `laporan_antrian_20260514.xlsx`**

**Isi laporan:**
- Total antrian
- Rata-rata waktu tunggu
- Layanan terbanyak
- Peak hours

---

### **Tips untuk Staff**

✅ **Panggil berurutan** - Jangan loncat nomor
✅ **Cek ulang nama** - Pastikan benar sebelum panggil
✅ **Update status** - Segera tandai selesai setelah pelayanan
✅ **Backup manual** - Jika sistem down, pakai buku antrian
✅ **Lapor IT** - Jika ada error, screenshot & kirim ke tim IT

---

## 👮 BAGIAN 3: UNTUK SECURITY/FRONT OFFICE

### **Tugas di Lobby**

1. **Arahkan masyarakat** untuk daftar online
2. **Bantu yang tidak bisa** pakai HP (gunakan tablet loket)
3. **Cek nomor antrian** - Pastikan sesuai jadwal
4. **Atur tempat duduk** - Prioritaskan yang hampir dipanggil
5. **Koordinasi dengan loket** - Update antrian yang belum datang

### **Script Bantu Masyarakat**

**"Selamat pagi, silakan daftar antrian online di website ini."**
[Sambil tunjukkan QR code]

**"Bapak/Ibu tidak punya HP? Saya bantu daftarkan."**
[Pakai tablet yang tersedia]

**"Nomor antrian A025, estimasi 40 menit lagi. Silakan duduk di area tunggu."**

**"SMS sudah masuk? Bagus, tunggu sampai ada panggilan."**

---

## 🔧 BAGIAN 4: TROUBLESHOOTING

### **Masalah: Website tidak bisa dibuka**

**Solusi:**
1. Cek koneksi internet
2. Refresh browser (F5)
3. Clear cache browser
4. Coba browser lain
5. Lapor IT jika masih error

### **Masalah: SMS tidak masuk**

**Solusi:**
1. Cek sinyal HP
2. Cek inbox penuh/tidak
3. Restart HP
4. Lapor staff untuk cek manual

### **Masalah: Nomor antrian tidak ditemukan**

**Solusi:**
1. Cek ulang nomor HP
2. Pastikan daftar hari ini (bukan kemarin)
3. Lapor staff untuk cek database

### **Masalah: Panel admin error**

**Solusi:**
1. Logout → Login ulang
2. Clear cache browser
3. Restart browser
4. Lapor IT dengan screenshot error

---

## 📞 KONTAK BANTUAN

**Helpdesk Disdukcapil:**
- 📞 Telp: (061) 7951234
- 📱 WA: 0812-3456-7890
- 📧 Email: helpdesk@disdukcapil.deliserdangkab.go.id
- 🕐 Jam: Senin-Jumat, 08:00-15:00 WIB

**Tim IT Support:**
- 📞 Ext: 123
- 📧 Email: it@deliserdangkab.go.id

---

## 📝 CATATAN PENTING

1. **Sistem ini untuk memudahkan**, bukan menggantikan pelayanan manual
2. **Tetap layani masyarakat** yang tidak bisa pakai teknologi
3. **Backup manual** selalu tersedia jika sistem down
4. **Feedback sangat dihargai** - Sampaikan ke staff atau via survey

---

**Terima kasih atas kerjasama Bapak/Ibu.**

**Mari wujudkan pelayanan publik yang lebih baik!** 🚀

---

**© 2026 Disdukcapil Kabupaten Deli Serdang**

**Versi:** 1.0.0
**Last Updated:** 14 Mei 2026
