# 🚀 Setup Guide - Fitur Baru

**Updated:** 2026-05-17  
**Features:** Admin Login, Print Ticket, Rating System

---

## 📦 **1. INSTALL DEPENDENCIES**

```bash
cd "MESIN ANTRIAN"
npm install
```

**New packages:**
- `jsonwebtoken` - JWT authentication
- `qrcode` - QR code generation
- `pdfkit` - PDF ticket generation

---

## 🔐 **2. SETUP DATABASE**

### **Import Schema:**

```bash
mysql -u root -p < database/schema.sql
```

**Or manually:**

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS antrian_disdukcapil;
USE antrian_disdukcapil;

-- Run schema.sql content
-- (Tables: antrian, users, log_aktivitas, ratings)
```

---

## 👤 **3. CREATE DEFAULT ADMIN**

**Default credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change password after first login!**

### **Generate Password Hash:**

```javascript
// generate-hash.js
import bcrypt from 'bcrypt';

const password = 'YourNewPassword123!';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

**Run:**
```bash
node generate-hash.js
```

### **Update Database:**

```sql
UPDATE users 
SET password = '$2b$10$YOUR_GENERATED_HASH_HERE' 
WHERE username = 'admin';
```

---

## 🔧 **4. CONFIGURE ENVIRONMENT**

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=antrian_disdukcapil

# JWT Secret (CHANGE THIS!)
JWT_SECRET=disdukcapil-deli-serdang-super-secret-key-2026-change-me

# SMS Gateway (Fonnte)
SMS_API_URL=https://api.fonnte.com/send
SMS_API_KEY=your_fonnte_api_key

# App
APP_PORT=3000
```

---

## 🚀 **5. START SERVER**

```bash
npm start
```

**Server running at:**
- Homepage: http://localhost:3000
- Admin Panel: http://localhost:3000/admin.html
- Login: http://localhost:3000/login.html

---

## 📋 **6. TEST FEATURES**

### **A. Admin Login**

1. Go to http://localhost:3000/login.html
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Should redirect to admin panel

### **B. Print Ticket**

1. Go to http://localhost:3000
2. Register new queue
3. After success, click "Cetak Ticket PDF"
4. PDF will download with QR code

### **C. Rating System**

1. Go to http://localhost:3000/rating.html?no=A001
   (Replace A001 with actual queue number)
2. Give rating (1-5 stars)
3. Add feedback (optional)
4. Submit

### **D. View Rating Stats (Admin)**

1. Login to admin panel
2. Click "Rating & Feedback" in sidebar
3. View:
   - Average rating
   - Total ratings
   - Rating distribution
   - Recent feedback

---

## 🔒 **7. SECURITY CHECKLIST**

- [ ] Change default admin password
- [ ] Update JWT_SECRET in .env
- [ ] Set proper file permissions
- [ ] Enable HTTPS in production
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for trusted domains
- [ ] Set up rate limiting
- [ ] Enable SQL injection protection (already using prepared statements)

---

## 📊 **8. API ENDPOINTS**

### **Authentication:**
```
POST   /api/auth/login       - Login admin
GET    /api/auth/verify      - Verify token
POST   /api/auth/logout      - Logout admin
```

### **Rating:**
```
POST   /api/rating           - Submit rating (public)
GET    /api/rating/stats     - Get rating stats (admin)
GET    /api/rating/recent    - Get recent ratings (admin)
```

### **Print Ticket:**
```
GET    /api/ticket/:no/pdf   - Generate PDF ticket
```

### **Protected Admin Routes:**
```
GET    /api/dashboard        - Dashboard stats
GET    /api/antrian/hari-ini - All queues today
GET    /api/antrian/menunggu - Waiting queues
POST   /api/antrian/panggil  - Call queue
POST   /api/antrian/selesai  - Mark complete
```

---

## 🎯 **9. RATING PAGE LINKS**

**Add to SMS/WhatsApp:**

```
Terima kasih telah menggunakan layanan kami.
Mohon beri rating: http://localhost:3000/rating.html?no={no_antrian}
```

**Add to Ticket PDF:**
```
Beri rating: http://localhost:3000/rating.html?no=A001
```

---

## 🐛 **10. TROUBLESHOOTING**

### **Problem: "Cannot find module 'jsonwebtoken'"**

**Solution:**
```bash
npm install
```

### **Problem: "Token invalid"**

**Solution:**
- Clear browser cache
- Check JWT_SECRET matches in .env
- Re-login

### **Problem: "PDF not downloading"**

**Solution:**
- Check if `pdfkit` is installed
- Check browser popup blocker
- Verify queue number exists

### **Problem: "Rating already submitted"**

**Solution:**
- Each queue can only be rated once
- Check database: `SELECT * FROM ratings WHERE no_antrian = 'A001'`

---

## 📝 **11. DATABASE SCHEMA**

### **New Table: ratings**

```sql
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    no_antrian VARCHAR(20) UNIQUE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (no_antrian) REFERENCES antrian(no_antrian) ON DELETE CASCADE
);
```

---

## 🎉 **12. SUCCESS INDICATORS**

**You've successfully implemented when:**

- ✅ Can login to admin panel
- ✅ Admin routes require authentication
- ✅ Can print PDF ticket with QR code
- ✅ Can submit rating from rating page
- ✅ Can view rating stats in admin
- ✅ Default admin password changed
- ✅ JWT_SECRET configured

---

## 🚀 **NEXT STEPS**

After setup, consider:

1. **WhatsApp Integration** - Replace SMS with WA
2. **TV Display** - Add display.html for waiting area
3. **Priority Queue** - Add lanes for elderly/disabled
4. **Analytics Dashboard** - Charts and graphs
5. **Multi-day Booking** - Allow advance registration

---

**Good luck! 🎯**
