const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(authenticateToken, requireAdmin);

// =================== PLATFORM STATS ===================
router.get('/stats', async (req, res) => {
  try {
    const [[userCount]] = await pool.query('SELECT COUNT(*) as total FROM users WHERE is_admin = 0');
    const [[jobCount]] = await pool.query('SELECT COUNT(*) as total FROM jobs');
    const [[completedCount]] = await pool.query("SELECT COUNT(*) as total FROM jobs WHERE status = 'completed'");
    const [[openCount]] = await pool.query("SELECT COUNT(*) as total FROM jobs WHERE status = 'open'");
    const [[assignedCount]] = await pool.query("SELECT COUNT(*) as total FROM jobs WHERE status = 'assigned'");
    const [[reviewStats]] = await pool.query('SELECT COUNT(*) as total, AVG(rating) as avgRating FROM reviews');
    const [[bannedCount]] = await pool.query('SELECT COUNT(*) as total FROM users WHERE is_banned = 1');
    const [[expertCount]] = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'expert' AND is_admin = 0");
    const [[clientCount]] = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'client' AND is_admin = 0");

    // Jobs by category
    const [categoryData] = await pool.query(
      "SELECT COALESCE(category, 'Uncategorized') as category, COUNT(*) as count FROM jobs GROUP BY category ORDER BY count DESC"
    );

    // Recent registrations (last 7 days)
    const [recentUsers] = await pool.query(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND is_admin = 0 GROUP BY DATE(created_at) ORDER BY date"
    );

    res.json({
      users: { total: userCount.total, experts: expertCount.total, clients: clientCount.total, banned: bannedCount.total },
      jobs: { total: jobCount.total, open: openCount.total, assigned: assignedCount.total, completed: completedCount.total, completionRate: jobCount.total > 0 ? ((completedCount.total / jobCount.total) * 100).toFixed(1) : 0 },
      reviews: { total: reviewStats.total, avgRating: reviewStats.avgRating ? Number(reviewStats.avgRating).toFixed(1) : '0.0' },
      categoryData,
      recentUsers
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
});

// =================== USER MANAGEMENT ===================
router.get('/users', async (req, res) => {
  try {
    const { search, role, banned, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    let where = ['is_admin = 0'];
    let params = [];

    if (search) { where.push('(username LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (role) { where.push('role = ?'); params.push(role); }
    if (banned !== undefined && banned !== '') { where.push('is_banned = ?'); params.push(Number(banned)); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role, u.user_rank, u.current_level, u.exp, u.is_banned, u.bio, u.location, u.created_at, u.last_active,
       (SELECT COUNT(*) FROM jobs WHERE expert_id = u.id AND status = 'completed') as jobs_completed,
       (SELECT AVG(rating) FROM reviews WHERE expert_id = u.id) as avg_rating
       FROM users u ${whereClause} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, username, email, role, user_rank, current_level, exp, bio, location, is_banned, created_at, last_active FROM users WHERE id = ?`,
      [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const [jobs] = await pool.query('SELECT id, title, status, category, created_at FROM jobs WHERE client_id = ? OR expert_id = ? ORDER BY created_at DESC LIMIT 20', [req.params.id, req.params.id]);
    const [reviews] = await pool.query(
      `SELECT r.*, u.username as reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.expert_id = ? ORDER BY r.created_at DESC LIMIT 10`,
      [req.params.id]
    );
    const [skills] = await pool.query('SELECT skill FROM user_skills WHERE user_id = ?', [req.params.id]);
    const [[stats]] = await pool.query(
      `SELECT (SELECT COUNT(*) FROM jobs WHERE expert_id = ? AND status = 'completed') as completed,
              (SELECT COUNT(*) FROM jobs WHERE client_id = ?) as posted,
              (SELECT AVG(rating) FROM reviews WHERE expert_id = ?) as avgRating`,
      [req.params.id, req.params.id, req.params.id]
    );

    res.json({ user: users[0], jobs, reviews, skills: skills.map(s => s.skill), stats });
  } catch (err) {
    console.error('Admin user detail error:', err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

router.put('/users/:id/ban', async (req, res) => {
  try {
    const { banned } = req.body;
    await pool.query('UPDATE users SET is_banned = ? WHERE id = ? AND is_admin = 0', [banned ? 1 : 0, req.params.id]);
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, "user", ?, ?)',
      [req.user.userId, banned ? 'ban_user' : 'unban_user', req.params.id, `User ${banned ? 'banned' : 'unbanned'}`]
    );
    res.json({ success: true, message: `User ${banned ? 'banned' : 'unbanned'} successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['client', 'expert'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    await pool.query('UPDATE users SET role = ? WHERE id = ? AND is_admin = 0', [role, req.params.id]);
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, "change_role", "user", ?, ?)',
      [req.user.userId, req.params.id, `Role changed to ${role}`]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// =================== JOB MONITORING ===================
router.get('/jobs', async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];

    if (status) { where.push('j.status = ?'); params.push(status); }
    if (category) { where.push('j.category = ?'); params.push(category); }
    if (search) { where.push('(j.title LIKE ? OR j.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM jobs j ${whereClause}`, params);
    const [jobs] = await pool.query(
      `SELECT j.*, c.username as client_name, e.username as expert_name
       FROM jobs j
       LEFT JOIN users c ON j.client_id = c.id
       LEFT JOIN users e ON j.expert_id = e.id
       ${whereClause} ORDER BY j.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    res.json({ jobs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.delete('/jobs/:id', async (req, res) => {
  try {
    await pool.query("UPDATE jobs SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, "cancel_job", "job", ?, "Job cancelled by admin")',
      [req.user.userId, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

// =================== REVIEWS MONITOR ===================
router.get('/reviews', async (req, res) => {
  try {
    const { rating, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];

    if (rating) { where.push('r.rating = ?'); params.push(Number(rating)); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM reviews r ${whereClause}`, params);
    const [reviews] = await pool.query(
      `SELECT r.*, reviewer.username as reviewer_name, expert.username as expert_name, j.title as job_title
       FROM reviews r
       JOIN users reviewer ON r.reviewer_id = reviewer.id
       JOIN users expert ON r.expert_id = expert.id
       LEFT JOIN jobs j ON r.job_id = j.id
       ${whereClause} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    // Rating distribution
    const [distribution] = await pool.query(
      'SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating'
    );

    res.json({ reviews, total, page: Number(page), totalPages: Math.ceil(total / limit), distribution });
  } catch (err) {
    console.error('Admin reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// =================== ACTIVITY LOG ===================
router.get('/activity', async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT a.*, u.username as admin_name FROM admin_logs a JOIN users u ON a.admin_id = u.id ORDER BY a.created_at DESC LIMIT 50`
    );
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

module.exports = router;
