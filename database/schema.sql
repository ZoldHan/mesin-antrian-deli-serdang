-- Database: antrian_disdukcapil
-- Tabel: antrian
CREATE TABLE IF NOT EXISTS antrian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    no_antrian VARCHAR(20) NOT NULL,
    nik VARCHAR(16) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    layanan VARCHAR(50) NOT NULL, -- KTP-El, KK, Akta, dll
    status ENUM('menunggu', 'dipanggil', 'selesai', 'batal') DEFAULT 'menunggu',
    tanggal DATE NOT NULL,
    waktu_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    waktu_dipanggil TIMESTAMP NULL,
    waktu_selesai TIMESTAMP NULL,
    keterangan TEXT
);

-- Tabel: users (untuk admin/staff)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'loket') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel: log_aktivitas
CREATE TABLE IF NOT EXISTS log_aktivitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    aktivitas VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel: ratings (NEW - for customer feedback)
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    no_antrian VARCHAR(20) UNIQUE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (no_antrian) REFERENCES antrian(no_antrian) ON DELETE CASCADE
);

-- Insert default admin (password: admin123 - CHANGE THIS!)
-- Password hashed with bcrypt cost 10
INSERT INTO users (username, password, role) VALUES 
('admin', '$2b$10$YgZv9xJxQxQxQxQxQxQxQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'admin');
