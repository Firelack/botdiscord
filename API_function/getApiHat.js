function getApiHat(message) {
// Avoir le chapeau api
    if (message.content.toLowerCase().startsWith("apichapeau:")) {
      // Récupérer la clé utilisateur à partir du message
      var userKey = message.content.substring(11).trim();

      // Mettre à jour les options de la deuxième requête avec la clé utilisateur
      var options = {
        'method': 'POST',
        'url': 'https://api.wolvesville.com/items/redeemApiHat',
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bot ${userKey}` // Utiliser la clé utilisateur comme clé de bot
        }
      };

      // Effectuer la deuxième requête
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