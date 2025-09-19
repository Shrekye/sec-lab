const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./sec-lab.db');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Accès refusé' });
  try {
    const decoded = jwt.verify(token, 'ton_secret_jwt_ici');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token invalide' });
  }
};

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    function(err) {
      if (err) return res.status(400).json({ message: 'Erreur lors de l\'inscription' });
      res.status(201).json({ message: 'Utilisateur créé' });
    }
  );
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });
    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'ton_secret_jwt_ici', { expiresIn: '1h' });
    res.json({ token, isAdmin: user.isAdmin });
  });
});

app.get('/challenges', authenticate, (req, res) => {
  db.all('SELECT * FROM challenges', [], (err, challenges) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(challenges);
  });
});

app.post('/challenges', authenticate, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Accès refusé' });
  const { title, description, category, difficulty, points, solution } = req.body;
  db.run(
    'INSERT INTO challenges (title, description, category, difficulty, points, solution) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, category, difficulty, points, solution],
    function(err) {
      if (err) return res.status(400).json({ message: 'Erreur lors de l\'ajout du défi' });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.post('/start-challenge', authenticate, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Accès refusé' });
  const { name } = req.body;
  exec(`sudo systemctl start ${name}`, (error) => {
    if (error) return res.status(500).json({ message: 'Erreur au démarrage du défi' });
    res.json({ message: `Défi ${name} démarré` });
  });
});

app.post('/stop-challenge', authenticate, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Accès refusé' });
  const { name } = req.body;
  exec(`sudo systemctl stop ${name}`, (error) => {
    if (error) return res.status(500).json({ message: 'Erreur à l\'arrêt du défi' });
    res.json({ message: `Défi ${name} arrêté` });
  });
});

app.get('/stats', authenticate, (req, res) => {
  db.get(
    'SELECT COUNT(*) as totalChallenges FROM challenges',
    [],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur' });
      res.json({ totalChallenges: row.totalChallenges });
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
