const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database setup
db.serialize(() => {
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
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        student_id INTEGER,
        percentage REAL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        subject TEXT,
        marks INTEGER
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS fees (
        student_id INTEGER,
        total REAL,
        paid REAL,
        due REAL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS hostel (
        student_id INTEGER,
        room TEXT,
        building TEXT,
        status TEXT
    )`);

    // Sample data
    db.run(`INSERT OR IGNORE INTO users (username, password) VALUES ('student1', 'pass123')`);
    db.run(`INSERT OR IGNORE INTO students (name, age, grade, email) VALUES ('John Doe', 20, 'A', 'john@example.com')`);
    db.run(`INSERT OR IGNORE INTO attendance (student_id, percentage) VALUES (1, 95.5)`);
    db.run(`INSERT OR IGNORE INTO results (student_id, subject, marks) VALUES (1, 'Math', 85), (1, 'Science', 90)`);
    db.run(`INSERT OR IGNORE INTO fees (student_id, total, paid, due) VALUES (1, 1000, 700, 300)`);
    db.run(`INSERT OR IGNORE INTO hostel (student_id, room, building, status) VALUES (1, '101', 'A Block', 'Occupied')`);
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err || !row) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ success: true });
    });
});

// API Routes
app.get('/api/personal', (req, res) => {
    db.get('SELECT * FROM students WHERE id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.get('/api/attendance', (req, res) => {
    db.get('SELECT percentage FROM attendance WHERE student_id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.get('/api/results', (req, res) => {
    db.all('SELECT subject, marks FROM results WHERE student_id = 1', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/fees', (req, res) => {
    db.get('SELECT total, paid, due FROM fees WHERE student_id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.get('/api/hostel', (req, res) => {
    db.get('SELECT room, building, status FROM hostel WHERE student_id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});