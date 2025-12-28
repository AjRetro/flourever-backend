const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config(); 

// --- SERVER CONFIG ---
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-12345';

const app = express();

// --- CORS FIX ---
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost')) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    console.log("🚫 BLOCKED ORIGIN:", origin);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true 
}));

app.use(express.json());

// --- LOGGER ---
app.use((req, res, next) => {
    console.log(`📡 Incoming ${req.method} request to ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send("✅ Backend is running!");
});

// --- DATABASE CONNECTION ---
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- EMAIL CONFIG (UPDATED FOR RENDER) ---
// Debugging: Check if variables exist
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ MISSING EMAIL ENV VARIABLES: Please add EMAIL_USER and EMAIL_PASS in Render.");
} else {
    console.log(`✅ Email Env Vars detected. User: ${process.env.EMAIL_USER}`);
}

// ⚠️ CHANGED: Switched from 'service: gmail' to explicit SMTP settings
// This fixes the "ETIMEDOUT" error on Render by forcing a secure SSL connection on port 465.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

// Verify Email Connection on Startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Email Connection Failed:", error);
  } else {
    console.log("✅ Email Server is ready to take messages");
  }
});

// --- AUTH ROUTES ---

app.post('/api/signup', async (req, res) => {
    console.log("📝 Signup Request Received:", req.body.email);
    
    try {
        const { email, password, firstName, lastName, gender, birthday } = req.body;
        
        // 1. Check DB
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log("⚠️ Email already exists");
            return res.status(400).json({ error: "Email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Send Email
        console.log(`📧 Attempting to send email to ${email} using user: ${process.env.EMAIL_USER}...`);
        
        try {
            await transporter.sendMail({
                from: `"FlourEver Bakery" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your FlourEver Verification Code',
                text: `Your code is: ${verificationCode}`
            });
            console.log("✅ Email SENT successfully!");
        } catch (emailError) {
            console.error("❌ CRITICAL: Email sending failed:", emailError);
            // We return 500 here so the frontend knows something went wrong
            return res.status(500).json({ error: "Failed to send email. Check backend logs." });
        }

        // 3. Insert User
        console.log("💾 Saving user to database...");
        await pool.query(
            'INSERT INTO users (email, password, firstName, lastName, gender, birthday, verification_code, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, firstName, lastName, gender, birthday, verificationCode, false]
        );
        console.log("✅ User saved!");

        res.status(201).json({ message: "Signup successful! Please check your email to verify." });
    } catch (err) {
        console.error("💥 Server Error during signup:", err);
        res.status(500).json({ error: "Server error during signup." });
    }
});

// 2. VERIFY
app.post('/api/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND verification_code = ?', [email, code]);
        if (users.length === 0) return res.status(400).json({ error: "Invalid code." });
        
        const user = users[0];
        await pool.query('UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE id = ?', [user.id]);
        
        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-12345';
        const token = jwt.sign({ userId: user.id, email: user.email, isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ message: "Verified!", token, user: { id: user.id, firstName: user.firstName, email: user.email, isAdmin: !!user.isAdmin } });
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
});

// 3. RESEND CODE
app.post('/api/resend-code', async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: "Email not found." });
        
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            await transporter.sendMail({
                from: `"FlourEver Bakery" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'New Verification Code',
                text: `Your new code is: ${newCode}`
            });
            
            await pool.query('UPDATE users SET verification_code = ? WHERE email = ?', [newCode, email]);
            res.json({ message: "Code resent successfully!" });

        } catch (e) { 
            console.error("Email failed:", e); 
            res.status(500).json({ error: "Could not send email. Try again later." });
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error." });
    }
});

// 4. LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.query(
            'SELECT id, firstName, email, password, isAdmin, is_verified, default_contact_number, default_address, default_lat, default_lng, default_instructions FROM users WHERE email = ?', 
            [email]
        );
        
        if (users.length === 0) return res.status(400).json({ error: "User not found." });
        
        const user = users[0];

        if (!user.is_verified) {
            return res.status(403).json({ 
                error: "Please verify your email first.", 
                needsVerification: true, 
                email: user.email 
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password." });
        
        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-12345';
        const token = jwt.sign({ 
            userId: user.id, 
            email: user.email, 
            isAdmin: !!user.isAdmin 
        }, JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ 
            message: "Logged in!", 
            token, 
            user: { 
                id: user.id, 
                firstName: user.firstName,
                email: user.email, 
                isAdmin: !!user.isAdmin,
                defaultContactNumber: user.default_contact_number,
                savedAddress: {
                    details: user.default_address,
                    coordinates: { lat: user.default_lat, lng: user.default_lng },
                    instructions: user.default_instructions
                }
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error." });
    }
});

// 5. FORGOT PASSWORD
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: "Email not found." });

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            await transporter.sendMail({
                from: `"FlourEver Bakery" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Reset Your Password',
                text: `Your password reset code is: ${code}`
            });

            await pool.query('UPDATE users SET verification_code = ? WHERE email = ?', [code, email]);
            res.json({ message: "Reset code sent!" });

        } catch (e) { 
            console.error("Email failed:", e); 
            res.status(500).json({ error: "Failed to send email. Check connection." });
        }

    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
});

// 6. RESET PASSWORD
app.post('/api/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND verification_code = ?', [email, code]);
        
        if (users.length === 0) return res.status(400).json({ error: "Invalid code." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = ?, verification_code = NULL WHERE email = ?', [hashedPassword, email]);

        res.json({ message: "Password changed successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
});

// 7. ADMIN LOGIN
app.post('/api/admin/login', async (req, res) => {
    try {
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "flourever_admin";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "BakeryMaster2024!"; 
        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-12345';

        const { username, password } = req.body;
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = jwt.sign({ isAdmin: true, username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '8h' });
            res.json({ message: "Admin login successful!", token, admin: { username: ADMIN_USERNAME }});
        } else {
            res.status(401).json({ error: "Invalid admin credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error during admin login." });
    }
});

// --- ADMIN ROUTES ---
// Copy the rest of your Admin Routes (Orders, Products, Users) here. 
// They don't need changes, just make sure they are below this line.
// For brevity, I'm verifying the email logic first.

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});