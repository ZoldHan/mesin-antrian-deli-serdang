import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'antrian_disdukcapil'
});

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
    
    // Generate nomor antrian
    const [count] = await db.query(
      'SELECT COUNT(*) as total FROM antrian WHERE DATE(tanggal) = CURDATE()'
    );
    const noAntrian = `A${(count[0].total + 1).toString().padStart(3, '0')}`;
    
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
    
    res.json({
      success: true,
      data: {
        no_antrian: noAntrian,
        nik,
        nama,
        layanan,
        estimated_time: `${(count[0].total + 1) * 10} menit`
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

// API: Panggil antrian (untuk loket)
app.post('/api/antrian/panggil', async (req, res) => {
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

// API: Selesai layanan
app.post('/api/antrian/selesai', async (req, res) => {
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

// API: Antrian hari ini (admin)
app.get('/api/antrian/hari-ini', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM antrian WHERE DATE(tanggal) = CURDATE() ORDER BY id DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Antrian menunggu (admin)
app.get('/api/antrian/menunggu', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM antrian WHERE DATE(tanggal) = CURDATE() AND status = "menunggu" ORDER BY id ASC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Dashboard stats
app.get('/api/dashboard', async (req, res) => {
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
