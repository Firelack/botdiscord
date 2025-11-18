// Download the express package: npm install express

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Le bot est en ligne !');
});

/**
 * Keep the bot alive by running a minimal Express server.
 * This is useful for hosting platforms that require an active web server.
 * @returns {void}
 */
function keepAlive() {
  app.listen(8080, () => {
    console.log('Serveur express démarré sur le port 8080');
  });
}

module.exports = keepAlive;