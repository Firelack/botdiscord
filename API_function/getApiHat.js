function getApiHat(message) {
// Get API hat
    if (message.content.toLowerCase().startsWith("apichapeau:")) {
      // Get user key from message
      var userKey = message.content.substring(11).trim();

      // Update options for second request with user key
      var options = {
        'method': 'POST',
        'url': 'https://api.wolvesville.com/items/redeemApiHat',
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bot ${userKey}` // Use user key as bot key
        }
      };

      // Make the second request
      axios(options)
        .then(response => {
          console.log(response.data);
          message.reply("La requête a été effectuée, allez vérifier dans votre inventaire et veuillez réinitialiser votre clé API pour plus de sécurité.");
        })
        .catch(error => {
          console.error(error);
          message.reply("Une erreur s'est produite lors de la requête.");
        });
    }
}
module.exports = getApiHat;