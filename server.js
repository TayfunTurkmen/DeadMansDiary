
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';
const SECRET_CHECKIN_TOKEN = crypto.randomBytes(32).toString('hex');

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./public/uploads')) {
  fs.mkdirSync('./public/uploads', { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./diary.db', (err) => {
  if (err) console.error(err);
  else console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    last_checkin DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tabs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tab_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tab_id) REFERENCES tabs(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  // Create default admin user
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (id, username, password, is_admin) VALUES (1, 'admin', ?, 1)`, [defaultPassword]);

  // Store secret check-in token
  db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('secret_checkin_token', ?)`, [SECRET_CHECKIN_TOKEN]);
});

// Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) return res.status(403).json({ error: 'Admin only' });
  next();
};

// Check if diary should be public (30 days no check-in)
function checkAutoPublish() {
  db.get('SELECT last_checkin FROM users WHERE is_admin = 1', (err, row) => {
    if (err || !row) return;

    const lastCheckin = new Date(row.last_checkin);
    const now = new Date();
    const daysDiff = (now - lastCheckin) / (1000 * 60 * 60 * 24);

    if (daysDiff >= 30) {
      db.run('UPDATE entries SET is_public = 1');
    }
  });
}

setInterval(checkAutoPublish, 60 * 60 * 1000); // Check every hour

// Auth routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, is_admin: user.is_admin } });
  });
});

app.post('/api/checkin', authenticateToken, requireAdmin, (req, res) => {
  db.run('UPDATE users SET last_checkin = CURRENT_TIMESTAMP WHERE id = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ message: 'Check-in successful' });
  });
});

// Secret URL check-in (no auth required)
app.get('/api/checkin/:token', (req, res) => {
  db.get('SELECT value FROM settings WHERE key = ?', ['secret_checkin_token'], (err, row) => {
    if (err || !row || row.value !== req.params.token) {
      return res.status(404).send('Not found');
    }

    db.run('UPDATE users SET last_checkin = CURRENT_TIMESTAMP WHERE is_admin = 1', (err) => {
      if (err) return res.status(500).send('Error');
      res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Check-in Başarılı</title>
          <style>
            body {
              font-family: 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
            }
            .success-box {
              background: white;
              padding: 40px;
              border-radius: 12px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .success-box h1 {
              color: #27ae60;
              font-size: 48px;
              margin: 0 0 20px 0;
            }
            .success-box p {
              color: #2c3e50;
              font-size: 18px;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="success-box">
            <h1>✅ Check-in Başarılı!</h1>
            <p>Günlüğünüz 30 gün daha özel kalacak.</p>
          </div>
        </body>
        </html>
      `);
    });
  });
});

// Get secret check-in URL (admin only)
app.get('/api/secret-url', authenticateToken, requireAdmin, (req, res) => {
  db.get('SELECT value FROM settings WHERE key = ?', ['secret_checkin_token'], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'Server error' });
    res.json({ url: `http://localhost:${PORT}/api/checkin/${row.value}` });
  });
});

// Image upload route
app.post('/api/upload-image', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Tab routes
app.get('/api/tabs', authenticateToken, (req, res) => {
  db.all('SELECT * FROM tabs ORDER BY position', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(rows);
  });
});

app.post('/api/tabs', authenticateToken, requireAdmin, (req, res) => {
  const { name, position } = req.body;
  db.run('INSERT INTO tabs (name, position) VALUES (?, ?)', [name, position], function(err) {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ id: this.lastID, name, position });
  });
});

app.put('/api/tabs/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, position } = req.body;
  db.run('UPDATE tabs SET name = ?, position = ? WHERE id = ?', [name, position, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ message: 'Tab updated' });
  });
});

app.delete('/api/tabs/:id', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM tabs WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ message: 'Tab deleted' });
  });
});

// Page routes
app.get('/api/pages/:tabId', authenticateToken, (req, res) => {
  db.all('SELECT * FROM pages WHERE tab_id = ? ORDER BY position', [req.params.tabId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(rows);
  });
});

app.post('/api/pages', authenticateToken, requireAdmin, (req, res) => {
  const { tab_id, name, position } = req.body;
  db.run('INSERT INTO pages (tab_id, name, position) VALUES (?, ?, ?)', [tab_id, name, position], function(err) {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ id: this.lastID, tab_id, name, position });
  });
});

app.put('/api/pages/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, position } = req.body;
  db.run('UPDATE pages SET name = ?, position = ? WHERE id = ?', [name, position, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ message: 'Page updated' });
  });
});

app.delete('/api/pages/:id', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM pages WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ message: 'Page deleted' });
  });
});

// Entry routes
app.get('/api/entries/:pageId', authenticateToken, (req, res) => {
  const query = req.user.is_admin
    ? 'SELECT * FROM entries WHERE page_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM entries WHERE page_id = ? AND is_public = 1 ORDER BY created_at DESC';

  db.all(query, [req.params.pageId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(rows);
  });
});

app.get('/api/entries/public/all', (req, res) => {
  // Check if request has valid admin token
  const token = req.headers['authorization']?.split(' ')[1];
  let isAdmin = false;

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err && user.is_admin) {
        isAdmin = true;
      }
    });
  }

  // Admin sees all entries, others see only public
  const query = isAdmin
    ? `SELECT e.*, p.name as page_name, t.name as tab_name
       FROM entries e
       JOIN pages p ON e.page_id = p.id
       JOIN tabs t ON p.tab_id = t.id
       ORDER BY e.created_at DESC`
    : `SELECT e.*, p.name as page_name, t.name as tab_name
       FROM entries e
       JOIN pages p ON e.page_id = p.id
       JOIN tabs t ON p.tab_id = t.id
       WHERE e.is_public = 1
       ORDER BY e.created_at DESC`;

  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(rows);
  });
});

app.post('/api/entries', authenticateToken, requireAdmin, (req, res) => {
  const { page_id, title, content, is_public } = req.body;
  db.run('INSERT INTO entries (page_id, title, content, is_public) VALUES (?, ?, ?, ?)',
    [page_id, title, content, is_public || 0], function(err) {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ id: this.lastID, page_id, title, content, is_public: is_public || 0 });
  });
});

app.put('/api/entries/:id', authenticateToken, requireAdmin, (req, res) => {
  const { title, content, is_public } = req.body;
  db.run('UPDATE entries SET title = ?, content = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, content, is_public, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ message: 'Entry updated' });
  });
});

app.delete('/api/entries/:id', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM entries WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ message: 'Entry deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
