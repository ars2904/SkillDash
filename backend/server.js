require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const { generateToken, authenticateToken } = require('./middleware/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. SOCKET.IO
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
});

// 3. MOUNT ADMIN ROUTES
app.use('/api/admin', adminRoutes);

// ============================================================
// ADMIN SEED — auto-create admin account on startup
// ============================================================
async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPass) {
      console.log('Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set in environment.');
      return;
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if (existing.length === 0) {
      const hash = await bcrypt.hash(adminPass, 10);
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role, user_rank, exp, current_level, is_admin, is_verified)
         VALUES ('SuperAdmin', ?, ?, 'expert', 'Legend', 0, 5, 1, 1)`,
        [adminEmail, hash]
      );
      console.log(`✅ Admin account seeded: ${adminEmail}`);
    }
  } catch (err) {
    console.log('Admin seed skipped (table may not be migrated yet):', err.message);
  }
}
seedAdmin();

// ============================================================
// AUTH ROUTES
// ============================================================

// --- OTP (bypassed as requested) ---
app.post('/api/auth/send-otp', (req, res) => res.json({ success: true, message: "OTP bypassed." }));
app.post('/api/auth/verify-otp', (req, res) => res.json({ success: true, message: "Bypass authorized." }));

// --- REGISTER ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, user_rank, exp, current_level, is_verified)
       VALUES (?, ?, ?, ?, 'Novice', 0, 1, 1)`,
      [username, email, hashedPassword, role]
    );

    const token = generateToken(result.insertId);

    // Log activity
    try {
      await pool.query(
        "INSERT INTO platform_activity (event_type, user_id, description) VALUES ('user_registered', ?, ?)",
        [result.insertId, `New ${role} registered: ${username}`]
      );
    } catch(e) {}

    res.status(201).json({
      success: true,
      token,
      userId: result.insertId,
      message: "Account created and verified!"
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (user.is_banned) return res.status(403).json({ error: "Account suspended. Contact support." });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user.id);

    // Update last_active
    pool.query('UPDATE users SET last_active = NOW() WHERE id = ?', [user.id]).catch(() => {});

    res.json({
      token,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      user_rank: user.user_rank,
      exp: user.exp,
      current_level: user.current_level,
      is_admin: user.is_admin || 0,
      bio: user.bio,
      location: user.location
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// --- PASSWORD RESET (FIXED: now hashes password) ---
app.put('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ error: "No account found." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);
    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Reset Error:", err);
    res.status(500).json({ error: "Failed to reset password." });
  }
});

// ============================================================
// USER PROFILE ROUTES
// ============================================================

app.put('/api/users/:id/profile', async (req, res) => {
  const { bio, location, skills, username } = req.body;
  try {
    await pool.query('UPDATE users SET bio = ?, location = ?, username = ? WHERE id = ?',
      [bio || null, location || 'Remote', username, req.params.id]);

    // Update skills
    if (Array.isArray(skills)) {
      await pool.query('DELETE FROM user_skills WHERE user_id = ?', [req.params.id]);
      for (const skill of skills.slice(0, 15)) {
        await pool.query('INSERT IGNORE INTO user_skills (user_id, skill) VALUES (?, ?)', [req.params.id, skill.trim()]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Admin Role Switcher
app.put('/api/users/:id/switch-role', authenticateToken, async (req, res) => {
  const { newRole } = req.body;
  if (!['client', 'expert'].includes(newRole)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  try {
    const [users] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [req.params.id]);
    if (!users.length || users[0].is_admin !== 1) {
      return res.status(403).json({ error: 'Only admins can switch roles dynamically' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [newRole, req.params.id]);
    res.json({ success: true, role: newRole });
  } catch (err) {
    console.error('Role switch error:', err);
    res.status(500).json({ error: 'Failed to switch role' });
  }
});

app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, user_rank, current_level, exp, bio, location, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const currentUserId = req.query.currentUserId;
    const [reviews] = await pool.query(
      `SELECT r.*, u.username as reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.expert_id = ? ORDER BY r.created_at DESC LIMIT 5`,
      [req.params.id]
    );
    const [[stats]] = await pool.query(
      `SELECT COUNT(*) as reviewCount, AVG(rating) as avgRating FROM reviews WHERE expert_id = ?`,
      [req.params.id]
    );
    const [skills] = await pool.query('SELECT skill FROM user_skills WHERE user_id = ?', [req.params.id]);
    const [jobHistory] = await pool.query(
      `SELECT id, title, status, category, exp_reward, created_at FROM jobs WHERE expert_id = ? OR client_id = ? ORDER BY created_at DESC LIMIT 10`,
      [req.params.id, req.params.id]
    );

    let connection = null;
    if (currentUserId) {
      const [conns] = await pool.query(
        'SELECT * FROM connections WHERE (user_one_id = ? AND user_two_id = ?) OR (user_one_id = ? AND user_two_id = ?)',
        [currentUserId, req.params.id, req.params.id, currentUserId]
      );
      if (conns.length > 0) connection = conns[0];
    }

    res.json({
      user: users[0],
      reviews,
      stats,
      skills: skills.map(s => s.skill),
      jobHistory,
      connection
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ============================================================
// CONNECTION SYSTEM
// ============================================================

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
       FROM connections c JOIN users u ON c.sender_id = u.id
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
       FROM connections c JOIN users u ON (c.user_one_id = u.id OR c.user_two_id = u.id)
       WHERE (c.user_one_id = ? OR c.user_two_id = ?)
       AND c.status = 'accepted' AND u.id != ?`,
      [req.params.userId, req.params.userId, req.params.userId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
// JOB SYSTEM (ENHANCED)
// ============================================================

app.post('/api/jobs', async (req, res) => {
  const { client_id, title, description, exp_reward, category, budget_amount, deadline, urgency, skills_required } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO jobs (client_id, title, description, exp_reward, category, budget_amount, deadline, urgency, skills_required, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [client_id, title, description, exp_reward || 5, category || 'Development', budget_amount || null, deadline || null, urgency || 'medium', skills_required || null]
    );

    try {
      await pool.query(
        "INSERT INTO platform_activity (event_type, user_id, description) VALUES ('job_posted', ?, ?)",
        [client_id, `New job posted: ${title}`]
      );
    } catch(e) {}

    res.status(201).json({ jobId: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/jobs', async (req, res) => {
  const { client_id, category, status, search, sort } = req.query;
  try {
    let where = [];
    let params = [];
    if (client_id) { where.push('j.client_id = ?'); params.push(client_id); }
    if (category && category !== 'all') { where.push('j.category = ?'); params.push(category); }
    if (status) { where.push('j.status = ?'); params.push(status); }
    if (search) { where.push('(j.title LIKE ? OR j.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    let orderBy = 'j.created_at DESC';
    if (sort === 'exp') orderBy = 'j.exp_reward DESC';
    if (sort === 'urgency') orderBy = "FIELD(j.urgency, 'critical','high','medium','low')";

    const [rows] = await pool.query(
      `SELECT j.*, u.username as client_name FROM jobs j LEFT JOIN users u ON j.client_id = u.id ${whereClause} ORDER BY ${orderBy}`,
      params
    );
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

app.get('/api/jobs/assigned/:expertId', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM jobs WHERE expert_id = ? AND status = 'assigned'", [req.params.expertId]);
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

// ============================================================
// APPLICATIONS
// ============================================================

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
    try {
      await pool.query(
        'INSERT INTO notifications (user_id, type, content) VALUES (?, "hired", ?)',
        [expert_id, `You have been hired for Job #${req.params.jobId}!`]
      );
    } catch(e) {}
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Hiring failed" }); }
});

// ============================================================
// COMPLETION & PROGRESSION
// ============================================================

app.put('/api/jobs/:jobId/complete', async (req, res) => {
  const { jobId } = req.params;
  const { review, rating } = req.body;
  try {
    const [jobRows] = await pool.query('SELECT client_id, expert_id, exp_reward FROM jobs WHERE id = ?', [jobId]);
    const job = jobRows[0];
    if (!job) return res.status(404).json({ error: "Job not found" });

    await pool.query('UPDATE jobs SET status = "completed" WHERE id = ?', [jobId]);

    // Expert EXP
    const [expertRows] = await pool.query('SELECT exp, current_level FROM users WHERE id = ?', [job.expert_id]);
    let eExp = expertRows[0].exp + (job.exp_reward || 0);
    let eLevel = expertRows[0].current_level;
    while (eLevel < 5 && eExp >= (eLevel * 100)) { eExp -= (eLevel * 100); eLevel++; }
    const expertRanks = ["Novice", "Initiate", "Associate", "Veteran", "Elite"];
    await pool.query('UPDATE users SET exp = ?, current_level = ?, user_rank = ? WHERE id = ?',
      [eExp, eLevel, expertRanks[eLevel - 1], job.expert_id]);

    // Client EXP
    const [clientRows] = await pool.query('SELECT exp, current_level FROM users WHERE id = ?', [job.client_id]);
    let cExp = clientRows[0].exp + 10;
    let cLevel = clientRows[0].current_level;
    while (cLevel < 5 && cExp >= (cLevel * 100)) { cExp -= (cLevel * 100); cLevel++; }
    const clientRanks = ["Novice", "Initiate", "Veteran", "Elite", "Legend"];
    await pool.query('UPDATE users SET exp = ?, current_level = ?, user_rank = ? WHERE id = ?',
      [cExp, cLevel, clientRanks[cLevel - 1], job.client_id]);

    // Review
    if (review && rating) {
      await pool.query('INSERT INTO reviews (job_id, reviewer_id, expert_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
        [jobId, job.client_id, job.expert_id, rating, review]);
    }

    // Activity log
    try {
      await pool.query(
        "INSERT INTO platform_activity (event_type, user_id, description) VALUES ('job_completed', ?, ?)",
        [job.expert_id, `Job #${jobId} completed`]
      );
    } catch(e) {}

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

// ============================================================
// NOTIFICATIONS
// ============================================================

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at ASC',
      [req.params.userId]
    );
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

// ============================================================
// MESSAGING
// ============================================================

app.post('/api/messages', async (req, res) => {
  const { job_id, sender_id, content } = req.body;
  try {
    await pool.query('INSERT INTO messages (job_id, sender_id, content) VALUES (?, ?, ?)', [job_id, sender_id, content]);

    const [jobRows] = await pool.query('SELECT client_id, expert_id FROM jobs WHERE id = ?', [job_id]);
    if (jobRows.length > 0) {
      const { client_id, expert_id } = jobRows[0];
      const receiverId = (sender_id === expert_id) ? client_id : expert_id;
      try {
        await pool.query(
          'INSERT INTO notifications (user_id, type, content) VALUES (?, "message", ?)',
          [receiverId, `New message in Job #${job_id}`]
        );
      } catch(e) {}
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

// ============================================================
// SEARCH & LEADERBOARD
// ============================================================

app.get('/api/users/search', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, user_rank, current_level FROM users WHERE username LIKE ? AND is_admin = 0 AND is_banned = 0 LIMIT 10',
      [`%${req.query.q}%`]
    );
    res.json(rows);
  } catch (err) { res.status(500).json(err); }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, user_rank, current_level, exp
       FROM users WHERE is_admin = 0 AND is_banned = 0
       ORDER BY current_level DESC, exp DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ error: "Failed to fetch rankings." });
  }
});

app.get('/api/history/:userId', async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT id, mission_name AS name, exp_gained AS exp, status
       FROM mission_history WHERE user_id = ? ORDER BY completed_at DESC`,
      [req.params.userId]
    );
    res.json(results);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Query failed" });
  }
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

// ============================================================
// JOB CATEGORIES (utility endpoint)
// ============================================================
app.get('/api/categories', (req, res) => {
  res.json([
    'Development', 'Design', 'Writing', 'Marketing',
    'Data', 'DevOps', 'Mobile', 'AI/ML', 'Other'
  ]);
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 FULL SERVER ACTIVE ON PORT ${PORT}`));