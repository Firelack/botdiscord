// Download the express package: npm install express

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Le bot est en ligne !');
});

function keepAlive() {
  app.listen(8080, () => {
    console.log('Serveur express démarré sur le port 8080');
  });
}

module.exports = keepAlive;