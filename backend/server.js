require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
//const db = require('./db'); 
const pool =require("./db");
const nodemailer = require('nodemailer');


const app = express();
const server = http.createServer(app);

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. EMAIL CONFIGURATION
/*
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Helps prevent connection drops on some cloud providers
    }
});*/

// 3. SOCKET.IO
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
});

// --- OTP AUTH SYSTEM ---

app.post('/api/auth/send-otp', async (req, res) => {
    return res.json({ success: true, message: "OTP bypassed for deployment." });
    /*const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    try {
        await pool.query(
            'INSERT INTO otp_verifications (email, otp_code, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        const mailOptions = {
            from: '"SkillDash Verify" <skilldash.verify@gmail.com>',
            to: email,
            subject: '🔐 SkillDash Verification Code',
            html: `
                <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
                    <h1 style="color: #f97316; font-style: italic; font-size: 24px;">SKILLDASH</h1>
                    <p style="color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 2px;">Verification Protocol</p>
                    <hr style="border: 0; border-top: 1px solid #222; margin: 20px 0;">
                    <p style="font-size: 14px;">Your authorization code is:</p>
                    <div style="background: #111; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #3b82f6;">${otp}</span>
                    </div>
                    <p style="font-size: 10px; color: #555;">This code expires in 10 minutes.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP transmitted." });

    } catch (err) {
        console.error("OTP Error:", err);
        res.status(500).json({ error: "Failed to send verification code." });
    } */
});

app.post('/api/auth/verify-otp', async (req, res) => {
    return res.json({ success: true, message: "Bypass authorized." });
    /*const { email, otp } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "No code found for this email." });
        }

        const record = rows[0];
        if (new Date() > new Date(record.expires_at)) {
            return res.status(400).json({ error: "Code has expired." });
        }

        if (record.otp_code !== otp) {
            return res.status(400).json({ error: "Invalid code." });
        }

        await pool.query('DELETE FROM otp_verifications WHERE email = ?', [email]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Verification failed." });
    }*/
});

// --- CORE USER ROUTES ---

const bcrypt = require('bcrypt'); // Make sure to npm install bcrypt

app.post('/api/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    // 1. Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        

        // 2. Insert into DB (is_verified is set to 1/true here)
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash, role,current_role user_rank, exp, current_level, is_verified) VALUES (?, ?, ?, ?, "Novice", 0, 1, 1)',
            [username, email, hashedPassword, role,role]
        );

        // 3. Send back a clearer success message
        res.status(201).json({ 
            success: true,
            userId: result.insertId,
            message: "Account created and verified!" 
        });

    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: "Registration failed. Email might already exist." }); 
    }
});

// --- PASSWORD RECOVERY SYSTEM ---

app.put('/api/auth/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    
    try {
        // 1. Check if user exists
        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: "No account found with this email." });
        }

        // 2. Update the password
        await pool.query(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [newPassword, email]
        );

        res.json({ success: true, message: "Security keys updated. You can now login." });
    } catch (err) {
        console.error("Reset Error:", err);
        res.status(500).json({ error: "Failed to reset password." });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        // 1. Check if user exists
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // 2. USE BCRYPT TO COMPARE (Crucial Step!)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        // 3. If match, send the user data
        res.json({ 
            id: user.id, 
            username: user.username,
            email: user.email, 
            role: user.role, 
            user_rank: user.user_rank,
            exp: user.exp,
            current_level: user.current_level
        });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: "Login failed" }); 
    }
});

// --- CONNECTION SYSTEM ---

app.post('/api/connections', async (req, res) => {
    const { user_one_id, user_two_id } = req.body;
    try {
        const [id1, id2] = [user_one_id, user_two_id].sort((a, b) => a - b);
        await pool.query(
            `INSERT INTO connections (user_one_id, user_two_id, status, sender_id) 
             VALUES (?, ?, "pending", ?) 
             ON DUPLICATE KEY UPDATE status="pending", sender_id=?`,
            [id1, id2, user_one_id, user_one_id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Connection failed" }); }
});

app.get('/api/friends/pending/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT c.id as connection_id, u.username as sender_name, u.id as sender_id 
             FROM connections c
             JOIN users u ON c.sender_id = u.id
             WHERE (c.user_one_id = ? OR c.user_two_id = ?) 
             AND c.status = 'pending' AND c.sender_id != ?`,
            [req.params.userId, req.params.userId, req.params.userId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/friends/respond', async (req, res) => {
    const { connection_id, status } = req.body;
    try {
        await pool.query('UPDATE connections SET status = ? WHERE id = ?', [status, connection_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

app.get('/api/friends/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT c.id as connection_id, u.id as id, u.username, u.user_rank, u.current_level 
             FROM connections c
             JOIN users u ON (c.user_one_id = u.id OR c.user_two_id = u.id)
             WHERE (c.user_one_id = ? OR c.user_two_id = ?) 
             AND c.status = 'accepted' AND u.id != ?`,
            [req.params.userId, req.params.userId, req.params.userId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- JOB SYSTEM ---

app.get('/api/jobs/assigned/:expertId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM jobs WHERE expert_id = ? AND status = "assigned"', [req.params.expertId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/jobs/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Job not found" });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/jobs', async (req, res) => {
    const { client_id, title, description, exp_reward, category } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO jobs (client_id, title, description, exp_reward, category, status) VALUES (?, ?, ?, ?, ?, "open")',
            [client_id, title, description, exp_reward, category]
        );
        res.status(201).json({ jobId: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/jobs', async (req, res) => {
    const { client_id } = req.query;
    try {
        let query = 'SELECT * FROM jobs';
        let params = [];
        if (client_id) { query += ' WHERE client_id = ?'; params.push(client_id); }
        const [rows] = await pool.query(query + ' ORDER BY created_at DESC', params);
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

// --- APPLICATIONS ---

app.post('/api/applications', async (req, res) => {
    const { job_id, expert_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO applications (job_id, expert_id, status) VALUES (?, ?, "pending") ON DUPLICATE KEY UPDATE status="pending"',
            [job_id, expert_id]
        );
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: "Application failed" }); }
});

app.get('/api/jobs/:jobId/applicants', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.id as application_id, a.status, u.id as expert_id, u.username, u.user_rank, u.current_level 
             FROM applications a JOIN users u ON a.expert_id = u.id WHERE a.job_id = ?`, 
            [req.params.jobId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Failed to fetch applicants" }); }
});

app.put('/api/jobs/:jobId/hire', async (req, res) => {
    const { expert_id } = req.body;
    try {
        await pool.query('UPDATE jobs SET status = "assigned", expert_id = ? WHERE id = ?', [expert_id, req.params.jobId]);
        await pool.query('UPDATE applications SET status = "accepted" WHERE job_id = ? AND expert_id = ?', [req.params.jobId, expert_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Hiring failed" }); }
});

// --- COMPLETION & PROGRESSION ---

app.put('/api/jobs/:jobId/complete', async (req, res) => {
    const { jobId } = req.params;
    const { review, rating } = req.body;

    try {
        // Fetch job
        const [jobRows] = await pool.query(
            'SELECT client_id, expert_id, exp_reward FROM jobs WHERE id = ?',
            [jobId]
        );

        const job = jobRows[0];
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        // Mark job as completed
        await pool.query(
            'UPDATE jobs SET status = "completed" WHERE id = ?',
            [jobId]
        );

        // ================= EXPERT EXP LOGIC =================
        const [expertRows] = await pool.query(
            'SELECT exp, current_level FROM users WHERE id = ?',
            [job.expert_id]
        );

        let eExp = expertRows[0].exp + (job.exp_reward || 0);
        let eLevel = expertRows[0].current_level;

        while (eLevel < 5 && eExp >= (eLevel * 100)) {
            eExp -= (eLevel * 100);
            eLevel++;
        }

        const expertRanks = [
            "Novice",
            "Initiate",
            "Associate",
            "Veteran",
            "Elite"
        ];

        await pool.query(
            'UPDATE users SET exp = ?, current_level = ?, user_rank = ? WHERE id = ?',
            [eExp, eLevel, expertRanks[eLevel - 1], job.expert_id]
        );

        // ================= CLIENT EXP LOGIC =================
        const [clientRows] = await pool.query(
            'SELECT exp, current_level FROM users WHERE id = ?',
            [job.client_id]
        );

        let cExp = clientRows[0].exp + 10;
        let cLevel = clientRows[0].current_level;

        while (cLevel < 10 && cExp >= (cLevel * 100)) {
            cExp -= (cLevel * 100);
            cLevel++;
        }

        const clientRanks = [
            "Novice",
            "Initiate",
            "Veteran",
            "Elite",
            "Legend",
        ];

        await pool.query(
            'UPDATE users SET exp = ?, current_level = ?, user_rank = ? WHERE id = ?',
            [cExp, cLevel, clientRanks[cLevel - 1], job.client_id]
        );

        // ================= REVIEW =================
        if (review && rating) {
            await pool.query(
                'INSERT INTO reviews (job_id, reviewer_id, expert_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
                [jobId, job.client_id, job.expert_id, rating, review]
            );
        }

        // ================= RESPONSE =================
        res.json({
            success: true,
            newLevel: eLevel,
            newRank: expertRanks[eLevel - 1],
            newExp: eExp,
            nextMilestone: eLevel < 5 ? eLevel * 100 : null
        });

    } catch (err) {
        console.error("Job Completion Error:", err);
        res.status(500).json({ error: "Job completion failed" });
    }
});

// Get unread notifications for a specific user
app.get('/api/notifications/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // 1. Get all unread notifications
        const [rows] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at ASC',
            [userId]
        );

        // 2. Mark them as read immediately so they don't pop up again on the next poll
        if (rows.length > 0) {
            const ids = rows.map(n => n.id);
            await pool.query('UPDATE notifications SET is_read = TRUE WHERE id IN (?)', [ids]);
        }

        res.json(rows);
    } catch (err) {
        console.error("Notification Error:", err);
        res.status(500).json({ error: "Could not fetch notifications" });
    }
});

// --- MESSAGING ---

app.post('/api/messages', async (req, res) => {
    const { job_id, sender_id, content } = req.body;
    try {
        // 1. Save the actual message
        await pool.query('INSERT INTO messages (job_id, sender_id, content) VALUES (?, ?, ?)', [job_id, sender_id, content]);

        // 2. Find out who the receiver is
        const [jobRows] = await pool.query('SELECT client_id, expert_id FROM jobs WHERE id = ?', [job_id]);
        if (jobRows.length > 0) {
            const { client_id, expert_id } = jobRows[0];
            
            // If sender is the expert, receiver is the client. If sender is client, receiver is expert.
            const receiverId = (sender_id === expert_id) ? client_id : expert_id;

            // 3. Create the notification for the receiver
            await pool.query(
                'INSERT INTO notifications (user_id, type, content) VALUES (?, "message", ?)',
                [receiverId, `New message in Job #${job_id}`]
            );
        }

        res.json({ success: true });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: "Message failed" }); 
    }
});

app.get('/api/jobs/:jobId/messages', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT m.*, u.username FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.job_id = ? ORDER BY m.created_at ASC',
            [req.params.jobId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SEARCH & PRIVATE MESSAGES ---

app.get('/api/users/search', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, user_rank, current_level FROM users WHERE username LIKE ? LIMIT 10', [`%${req.query.q}%`]);
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

app.get('/api/connections/:connectionId/messages', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT m.*, u.username FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.connection_id = ? ORDER BY m.created_at ASC',
            [req.params.connectionId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/connections/messages', async (req, res) => {
    const { connection_id, sender_id, content } = req.body;
    try {
        await pool.query('INSERT INTO messages (connection_id, sender_id, content) VALUES (?, ?, ?)', [connection_id, sender_id, content]);
        res.json({ success: true });
    } catch (err) { res.status(500).json(err); }
});

// --- LEADERBOARD SYSTEM ---

app.get('/api/leaderboard', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, username, user_rank, current_level, exp 
            FROM users 
            ORDER BY current_level DESC, exp DESC 
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) {
        console.error("Leaderboard Error:", err);
        res.status(500).json({ error: "Failed to fetch global rankings." });
    }
});

app.get('/api/history/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT 
      id, 
      mission_name AS name, 
      exp_gained AS exp, 
      status 
    FROM mission_history 
    WHERE user_id = ? 
    ORDER BY completed_at DESC
  `;

  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Query failed" });
    }
    res.json(results);
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.send("Database working ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database failed ❌");
  }
});
// backend/server.js

app.get('/api/connections/:userId', (req, res) => {
  const { userId } = req.params;

  /**
   * For now, we will fetch OTHER users as "potential connections" 
   * so your UI isn't empty. Later, you can filter this by a 'friends' table.
   */
  const sql = "SELECT id, username, user_rank FROM users WHERE id != ? LIMIT 4";

  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results); // This returns the JSON array your frontend expects
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 FULL SERVER ACTIVE ON PORT ${PORT}`));