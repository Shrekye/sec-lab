const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./sec-lab.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      isAdmin BOOLEAN DEFAULT FALSE,
      score INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      category TEXT,
      difficulty TEXT,
      points INTEGER,
      solution TEXT
    )
  `);

  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(
    'INSERT OR IGNORE INTO users (username, email, password, isAdmin) VALUES (?, ?, ?, ?)',
    ['admin', 'admin@example.com', adminPassword, 1]
  );

  db.run(
    'INSERT OR IGNORE INTO challenges (title, description, category, difficulty, points, solution) VALUES (?, ?, ?, ?, ?, ?)',
    ['SQL Injection Basique', 'Trouvez le mot de passe admin.', 'Web', 'Facile', 100, 'admin123']
  );

  db.run(
    'INSERT OR IGNORE INTO challenges (title, description, category, difficulty, points, solution) VALUES (?, ?, ?, ?, ?, ?)',
    ['Chiffrement César', 'Déchiiffrez ce message.', 'Cryptographie', 'Moyen', 200, 'hello']
  );

  console.log('Base de données initialisée avec succès !');
});

db.close();
