const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Bienvenue dans le défi Web1 🚀</h1><p>Trouve le flag caché !</p>');
});

app.listen(38001, () => {
  console.log('Défi Web1 lancé sur le port 38001');
});
