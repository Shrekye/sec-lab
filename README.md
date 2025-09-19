```bash
cd Documents/sec-lab/backend
npm install sqlite3
npm install bcryptjs
npm install
node init_db.js
npm install express body-parser cors jsonwebtoken

cd Documents/sec-lab/backend
node server.js

cd Documents/sec-lab/frontend
python3 -m http.server 8000
```

http://localhost:8000/index.html

login:
- email: admin@example.com
- password: admin123

start chall:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now /home/shrk/Documents/sec-lab/deploy/web1.service
```