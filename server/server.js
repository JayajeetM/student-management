require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();

// Database Configuration for Render
const dbPath = process.env.RENDER 
  ? '/opt/render/.cache/database.db' 
  : path.join(__dirname, 'database.db');

// Ensure database directory exists
if (process.env.RENDER) {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at:', dbPath);
});

// Middleware
app.use(cors());
app.use(express.json());

// Static files serving with fallback for Render
const staticDir = process.env.RENDER 
  ? path.join(__dirname, 'public') 
  : path.join(__dirname, '../public');

if (!fs.existsSync(staticDir)) {
  console.warn('⚠️ Frontend directory not found at:', staticDir);
}

app.use(express.static(staticDir));

// Database Initialization
const initializeDatabase = () => {
  db.serialize(() => {
    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER,
      grade TEXT,
      email TEXT
    )`);

    // ... (keep all your other table creation queries)

    // Seed initial data
    const saltRounds = 10;
    bcrypt.hash('pass123', saltRounds, (err, hash) => {
      if (!err) {
        db.run(`INSERT OR IGNORE INTO users (username, password) VALUES ('student1', ?)`, [hash]);
      }
    });

    // ... (keep all your other seed data queries)
  });
};

// API Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Authentication error' });
      }
      
      res.json({ 
        success: result,
        message: result ? 'Login successful' : 'Invalid credentials'
      });
    });
  });
});

// ... (keep all your other API routes with the same implementations)

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Frontend Fallback Route (MUST BE LAST)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Server Initialization
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Static files served from: ${staticDir}`);
  console.log(`💾 Database location: ${dbPath}`);
  initializeDatabase();
});
