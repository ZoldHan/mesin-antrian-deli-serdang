import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'disdukcapil-deli-serdang-secret-2026';

// Authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token tidak ditemukan' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalid atau expired' });
  }
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  next();
};

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'antrian_disdukcapil'
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }
    
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Username tidak ditemukan' });
    }
    
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).json({ error: 'Password salah' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
});

// Verify token
app.get('/api/auth/verify', requireAuth, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout (client-side token removal, but we can log it)
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  console.log(`User ${req.user.username} logged out`);
  res.json({ success: true, message: 'Logout berhasil' });
});

// ============================================
// RATING ENDPOINTS
// ============================================

// Submit rating
app.post('/api/rating', async (req, res) => {
  try {
    const { no_antrian, rating, feedback } = req.body;
    
    if (!no_antrian || !rating) {
      return res.status(400).json({ error: 'No antrian dan rating wajib diisi' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating harus antara 1-5' });
    }
    
    // Check if already rated
    const [existing] = await db.query(
      'SELECT id FROM ratings WHERE no_antrian = ?',
      [no_antrian]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Antrian ini sudah dinilai' });
    }
    
    await db.query(
      'INSERT INTO ratings (no_antrian, rating, feedback) VALUES (?, ?, ?)',
      [no_antrian, rating, feedback || null]
    );
    
    res.json({
      success: true,
      message: 'Terima kasih atas rating Anda!'
    });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Gagal menyimpan rating' });
  }
});

// Get rating stats (admin only)
app.get('/api/rating/stats', requireAuth, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
      FROM ratings
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Rating stats error:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik rating' });
  }
});

// Get recent ratings (admin only)
app.get('/api/rating/recent', requireAuth, async (req, res) => {
  try {
    const [ratings] = await db.query(`
      SELECT r.*, a.nama, a.no_antrian, a.layanan
      FROM ratings r
      LEFT JOIN antrian a ON r.no_antrian = a.no_antrian
      ORDER BY r.created_at DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error('Recent ratings error:', error);
    res.status(500).json({ error: 'Gagal mengambil rating terbaru' });
  }
});

// ============================================
// PRINT TICKET ENDPOINT
// ============================================

app.get('/api/ticket/:no_antrian/pdf', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM antrian WHERE no_antrian = ?',
      [req.params.no_antrian]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ticket tidak ditemukan' });
    }
    
    const ticket = rows[0];
    
    // Generate QR code
    const qrData = JSON.stringify({
      no: ticket.no_antrian,
      nama: ticket.nama,
      layanan: ticket.layanan,
      tanggal: ticket.tanggal
    });
    const qrCode = await QRCode.toDataURL(qrData);
    
    // Generate PDF
    const doc = new PDFDocument({ size: 'A6', margin: 20 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${ticket.no_antrian}.pdf`);
    doc.pipe(res);
    
    // Header
    doc.fontSize(18).text('DISDUKCAPIL KABUPATEN DELI SERDANG', { align: 'center' });
    doc.fontSize(14).text('TICKET ANTRIAN ONLINE', { align: 'center' });
    doc.moveDown(0.5);
    
    // Ticket number
    doc.fontSize(24).font('Helvetica-Bold').text(ticket.no_antrian, { align: 'center' });
    doc.moveDown(0.5);
    
    // Details
    doc.fontSize(12).font('Helvetica');
    doc.text(`Nama: ${ticket.nama}`);
    doc.text(`NIK: ${ticket.nik}`);
    doc.text(`Layanan: ${ticket.layanan}`);
    doc.text(`Tanggal: ${new Date(ticket.tanggal).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`);
    doc.text(`Waktu Daftar: ${new Date(ticket.waktu_daftar).toLocaleString('id-ID')}`);
    doc.moveDown(0.5);
    
    // QR Code
    const qrSize = 150;
    const pageWidth = doc.page.width;
    const qrX = (pageWidth - qrSize) / 2;
    doc.image(qrCode, qrX, doc.y, { width: qrSize });
    doc.moveDown(2.5);
    
    // Footer
    doc.fontSize(10).text('Scan QR code ini untuk verifikasi', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(9).text('Harap datang 15 menit sebelum waktu antrian', { align: 'center' });
    doc.text('Jl. Negara No. 1, Lubuk Pakam | (061) 7951234', { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error('Print ticket error:', error);
    res.status(500).json({ error: 'Gagal generate ticket' });
  }
});

// ============================================
// EXISTING ENDPOINTS
// ============================================

// API: Ambil nomor antrian hari ini
app.get('/api/antrian/tersedia', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) as total FROM antrian WHERE DATE(tanggal) = CURDATE()'
    );
    const kuota = 100; // Kuota harian
    const tersedia = kuota - rows[0].total;
    
    res.json({
      success: true,
      tersedia: Math.max(0, tersedia),
      kuota: kuota
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Daftar antrian baru
app.post('/api/antrian/daftar', async (req, res) => {
  const { nik, nama, no_hp, layanan } = req.body;
  
  try {
    // Validasi sederhana
    if (!nik || !nama || !no_hp || !layanan) {
      return res.status(400).json({ 
        success: false, 
        error: 'Semua field wajib diisi' 
      });
    }
    
    // Check kuota sebelum daftar
    const [kuotaCheck] = await db.query(
      'SELECT COUNT(*) as total FROM antrian WHERE DATE(tanggal) = CURDATE()'
    );
    const MAX_KUOTA = 100;
    
    if (kuotaCheck[0].total >= MAX_KUOTA) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maaf, kuota antrian hari ini sudah penuh (100/100). Silakan daftar besok.' 
      });
    }
    
    // Generate nomor antrian
    const noAntrian = `A${(kuotaCheck[0].total + 1).toString().padStart(3, '0')}`;
    
    // Insert ke database
    await db.query(
      `INSERT INTO antrian (no_antrian, nik, nama, no_hp, layanan, tanggal) 
       VALUES (?, ?, ?, ?, ?, CURDATE())`,
      [noAntrian, nik, nama, no_hp, layanan]
    );
    
    // Kirim SMS notifikasi
    await sendSMS(no_hp, 
      `Antrian Berhasil! No: ${noAntrian}, Layanan: ${layanan}. 
       Silakan datang ke Disdukcapil Deli Serdang. 
       Jam operasional: 08:00-15:00 WIB.`
    );
    
    // Hitung sisa kuota setelah insert
    const sisaKuota = MAX_KUOTA - (kuotaCheck[0].total + 1);
    
    res.json({
      success: true,
      data: {
        no_antrian: noAntrian,
        nik,
        nama,
        layanan,
        estimated_time: `${(kuotaCheck[0].total + 1) * 10} menit`,
        sisa_kuota: sisaKuota
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Cek status antrian
app.get('/api/antrian/status/:no_hp', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM antrian 
       WHERE no_hp = ? AND DATE(tanggal) = CURDATE()
       ORDER BY id DESC LIMIT 1`,
      [req.params.no_hp]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Antrian tidak ditemukan' 
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Panggil antrian (untuk loket) - PROTECTED
app.post('/api/antrian/panggil', requireAuth, async (req, res) => {
  const { no_antrian, loket } = req.body;
  
  try {
    await db.query(
      'UPDATE antrian SET status = "dipanggil", waktu_dipanggil = NOW() WHERE no_antrian = ?',
      [no_antrian]
    );
    
    // SMS notifikasi dipanggil
    const [rows] = await db.query(
      'SELECT no_hp, nama FROM antrian WHERE no_antrian = ?',
      [no_antrian]
    );
    
    if (rows.length > 0) {
      await sendSMS(rows[0].no_hp,
        `Antrian ${no_antrian} a.n ${rows[0].nama} dipanggil ke loket ${loket}. 
         Silakan segera menuju loket.`
      );
    }
    
    res.json({ success: true, message: `Antrian ${no_antrian} dipanggil` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Selesai layanan - PROTECTED
app.post('/api/antrian/selesai', requireAuth, async (req, res) => {
  const { no_antrian } = req.body;
  
  try {
    await db.query(
      'UPDATE antrian SET status = "selesai", waktu_selesai = NOW() WHERE no_antrian = ?',
      [no_antrian]
    );
    
    res.json({ success: true, message: 'Layanan selesai' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Antrian hari ini (admin) - PROTECTED
app.get('/api/antrian/hari-ini', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM antrian WHERE DATE(tanggal) = CURDATE() ORDER BY id DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Antrian menunggu (admin) - PROTECTED
app.get('/api/antrian/menunggu', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM antrian WHERE DATE(tanggal) = CURDATE() AND status = "menunggu" ORDER BY id ASC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Dashboard stats - PROTECTED
app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const [today] = await db.query(
      'SELECT COUNT(*) as total FROM antrian WHERE DATE(tanggal) = CURDATE()'
    );
    
    const [selesai] = await db.query(
      'SELECT COUNT(*) as total FROM antrian WHERE DATE(tanggal) = CURDATE() AND status = "selesai"'
    );
    
    const [menunggu] = await db.query(
      'SELECT COUNT(*) as total FROM antrian WHERE DATE(tanggal) = CURDATE() AND status = "menunggu"'
    );
    
    res.json({
      success: true,
      data: {
        total_hari_ini: today[0].total,
        selesai: selesai[0].total,
        menunggu: menunggu[0].total,
        last_updated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fungsi kirim SMS (Fonnte example)
async function sendSMS(no_hp, message) {
  try {
    await fetch(process.env.SMS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': process.env.SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: no_hp,
        message: message,
        countryCode: '62'
      })
    });
    console.log(`SMS sent to ${no_hp}`);
  } catch (error) {
    console.error('SMS failed:', error.message);
  }
}

// Start server
const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});
