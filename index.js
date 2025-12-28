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

// --- EMAIL CONFIG (SERVICE: GMAIL FIX) ---
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ MISSING EMAIL ENV VARIABLES");
} else {
    console.log(`✅ Email Env Vars detected. User: ${process.env.EMAIL_USER}`);
}

// ⚠️ FIXED: Using 'service: gmail' with debug logs. 
// This handles port 465/587 automatically and is more robust for Gmail.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  },
  logger: true, // Prints SMTP traffic to logs
  debug: true   // Details for debugging
});

// Verify Email Connection on Startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Email Connection Failed:", error);
  } else {
    console.log("✅ Email Server is ready to take messages");
  }
});

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: 'Admin access required' });
  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) return res.status(403).json({ error: 'Invalid admin token' });
    if (!admin.isAdmin) return res.status(403).json({ error: 'Admin privileges required' });
    req.admin = admin;
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/signup', async (req, res) => {
    console.log("📝 Signup Request Received:", req.body.email);
    try {
        const { email, password, firstName, lastName, gender, birthday } = req.body;
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: "Email already exists." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        console.log(`📧 Sending email via Gmail Service...`);
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
            return res.status(500).json({ error: "Failed to send email. Check backend logs." });
        }

        await pool.query(
            'INSERT INTO users (email, password, firstName, lastName, gender, birthday, verification_code, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, firstName, lastName, gender, birthday, verificationCode, false]
        );
        res.status(201).json({ message: "Signup successful! Please check your email to verify." });
    } catch (err) {
        console.error("💥 Server Error during signup:", err);
        res.status(500).json({ error: "Server error during signup." });
    }
});

app.post('/api/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND verification_code = ?', [email, code]);
        if (users.length === 0) return res.status(400).json({ error: "Invalid code." });
        
        const user = users[0];
        await pool.query('UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE id = ?', [user.id]);
        
        const token = jwt.sign({ userId: user.id, email: user.email, isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: "Verified!", token, user: { id: user.id, firstName: user.firstName, email: user.email, isAdmin: !!user.isAdmin } });
    } catch (err) { res.status(500).json({ error: "Server error." }); }
});

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
            res.status(500).json({ error: "Could not send email." }); 
        }
    } catch (err) { res.status(500).json({ error: "Server error." }); }
});

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
            return res.status(403).json({ error: "Please verify your email first.", needsVerification: true, email: user.email });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password." });
        
        const token = jwt.sign({ userId: user.id, email: user.email, isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ 
            message: "Logged in!", token, 
            user: { 
                id: user.id, firstName: user.firstName, email: user.email, isAdmin: !!user.isAdmin,
                defaultContactNumber: user.default_contact_number,
                savedAddress: { details: user.default_address, coordinates: { lat: user.default_lat, lng: user.default_lng }, instructions: user.default_instructions }
            } 
        });
    } catch (err) { res.status(500).json({ error: "Server error." }); }
});

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
        } catch (e) { console.error("Email failed:", e); res.status(500).json({ error: "Failed to send email." }); }
    } catch (err) { res.status(500).json({ error: "Server error." }); }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND verification_code = ?', [email, code]);
        if (users.length === 0) return res.status(400).json({ error: "Invalid code." });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await pool.query('UPDATE users SET password = ?, verification_code = NULL WHERE email = ?', [hashedPassword, email]);
        res.json({ message: "Password changed successfully!" });
    } catch (err) { res.status(500).json({ error: "Server error." }); }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "flourever_admin";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "BakeryMaster2024!"; 
        const { username, password } = req.body;
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = jwt.sign({ isAdmin: true, username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '8h' });
            res.json({ message: "Admin login successful!", token, admin: { username: ADMIN_USERNAME }});
        } else {
            res.status(401).json({ error: "Invalid admin credentials" });
        }
    } catch (err) { res.status(500).json({ error: "Server error during admin login." }); }
});

// --- RESTORED ADMIN ROUTES (These were missing!) ---

app.get('/api/admin/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products WHERE isActive = TRUE');
    const [[{ pendingOrders }]] = await pool.query('SELECT COUNT(*) as pendingOrders FROM orders WHERE orderStatus = "Pending"');
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders');
    res.json({ totalProducts, pendingOrders, totalUsers, totalOrders });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.put('/api/admin/products/:productId', authenticateAdmin, async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, category, imageURL, isFeatured, isBestSeller } = req.body;
  try {
    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, imageURL = ?, isFeatured = ?, isBestSeller = ? WHERE id = ?',
      [name, description, price, category, imageURL, isFeatured, isBestSeller, productId]
    );
    res.json({ message: 'Product updated successfully!' });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.firstName, u.lastName, u.email 
       FROM orders o 
       JOIN users u ON o.customer_id = u.id 
       ORDER BY o.orderDate DESC`
    );
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [orderItems] = await pool.query(
          `SELECT oi.*, p.name, p.imageURL, p.category 
           FROM order_items oi 
           JOIN products p ON oi.productId = p.id 
           WHERE oi.orderId = ?`,
          [order.id]
        );
        return { ...order, items: orderItems };
      })
    );
    res.status(200).json(ordersWithItems);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.put('/api/admin/orders/:orderId', authenticateAdmin, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE orders SET orderStatus = ? WHERE id = ?', [status, orderId]);
    res.json({ message: `Order status updated to ${status}` });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, email, firstName, lastName, is_verified, createdAt FROM users ORDER BY createdAt DESC');
        res.status(200).json(users);
    } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete('/api/admin/users/:userId', authenticateAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      await connection.query('DELETE FROM order_items WHERE orderId IN (SELECT id FROM orders WHERE customer_id = ?)', [userId]);
      await connection.query('DELETE FROM orders WHERE customer_id = ?', [userId]);
      await connection.query('DELETE FROM users WHERE id = ?', [userId]);
      await connection.commit();
      res.json({ message: `User deleted successfully` });
    } catch (err) { await connection.rollback(); throw err; } finally { connection.release(); }
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY isActive DESC, category, name');
        res.status(200).json(products);
    } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
  const { name, description, price, category, imageURL, isFeatured, isBestSeller } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, category, imageURL, isFeatured, isBestSeller) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, category, imageURL, isFeatured || true, isBestSeller || false]
    );
    res.status(201).json({ message: 'Product added successfully!', productId: result.insertId });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete('/api/admin/products/:productId', authenticateAdmin, async (req, res) => {
  const { productId } = req.params;
  try {
    await pool.query('UPDATE products SET isActive = FALSE WHERE id = ?', [productId]);
    res.json({ message: 'Product archived successfully.' });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.put('/api/admin/products/:productId/restore', authenticateAdmin, async (req, res) => {
  const { productId } = req.params;
  try {
    await pool.query('UPDATE products SET isActive = TRUE WHERE id = ?', [productId]);
    res.json({ message: 'Product restored successfully!' });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// --- PUBLIC & USER ROUTES ---

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE isActive = TRUE ORDER BY category, name');
    res.status(200).json(rows);
  } catch (err) { res.status(500).json({ error: "Server error fetching products" }); }
});

app.post('/api/checkout', authenticateToken, async (req, res) => {
    const { userId } = req.user;
    const { items, deliveryAddress, contactNumber, coordinates, instructions } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        let calculatedTotal = 0;
        const [products] = await connection.query('SELECT id, price FROM products WHERE id IN (?)', [items.map(i => i.id)]);
        const orderItemsData = [];
        for (const item of items) {
            const product = products.find(p => p.id === item.id);
            if (!product) throw new Error(`Product ID ${item.id} not found.`);
            const basePrice = parseFloat(product.price);
            const itemPrice = (item.size === 'Large') ? (basePrice * 1.5) : basePrice;
            calculatedTotal += itemPrice * item.quantity;
            orderItemsData.push([null, item.id, item.quantity, item.size, itemPrice]);
        }
        const [orderResult] = await connection.query(
            `INSERT INTO orders (customer_id, totalPrice, orderStatus, deliveryAddress, contactNumber, delivery_lat, delivery_lng, delivery_instructions, orderDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [userId, calculatedTotal, 'Pending', deliveryAddress, contactNumber, coordinates?.lat, coordinates?.lng, instructions]
        );
        const orderId = orderResult.insertId;
        for (const itemData of orderItemsData) itemData[0] = orderId;
        await connection.query('INSERT INTO order_items (orderId, productId, quantity, size, priceAtPurchase) VALUES ?', [orderItemsData]);
        await connection.commit();
        res.status(201).json({ message: 'Order placed successfully!', orderId: orderId });
    } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ error: "Server error during checkout." }); } 
    finally { if (connection) connection.release(); }
});

app.post('/api/orders/:orderId/feedback', authenticateToken, async (req, res) => {
    const { orderId } = req.params;
    const { rating, feedback, issue, requestRedelivery } = req.body;
    try {
        if (rating) {
            await pool.query('UPDATE orders SET rating = ?, feedback = ? WHERE id = ?', [rating, feedback, orderId]);
        } else {
            await pool.query('UPDATE orders SET issue_reported = ?, feedback = ?, request_redelivery = ? WHERE id = ?', [issue, feedback, requestRedelivery, orderId]);
        }
        res.json({ message: 'Feedback received.' });
    } catch (err) { res.status(500).json({ error: "Server error." }); }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
    const { userId } = req.user;
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY orderDate DESC', [userId]);
        res.status(200).json(orders);
    } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
    const { userId } = req.user;
    try {
        const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(userRows[0]);
    } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    const { userId } = req.user;
    const { firstName, lastName, description, profileImageUrl } = req.body;
    try {
        await pool.query('UPDATE users SET firstName = ?, lastName = ?, description = ?, profileImageUrl = ? WHERE id = ?', [firstName, lastName, description, profileImageUrl, userId]);
        res.status(200).json({ message: "Profile updated" });
    } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});