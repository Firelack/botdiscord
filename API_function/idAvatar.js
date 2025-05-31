function idAvatar(message, axios, headers) {
// Récupérer l'avatar correspondant a un id
    if (message.content.toLowerCase().startsWith("idavatar:")) {
      var sharedAvatarId = message.content.substring(9).trim();

      axios.get(`https://api.wolvesville.com/avatars/${sharedAvatarId}`, {
        headers: headers
      })
        .then(response => {
          const data = response.data;
          const selectedInfo = {
            "id": data.id, // Utiliser data.id au lieu de response.id
            "url": data.avatar.url // Utiliser data.avatar.url au lieu de reponse.avatar.url
          };

          const nouvelleExtension = "@3x.png";
          const newurl = selectedInfo.url.replace(".png", nouvelleExtension);

          message.reply(`**__Id du skin:__** ${selectedInfo.id}:\n**__Avatar correspondant:__** [lien](${newurl})`);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête, vérifier les informations fournies.");
          console.error(error);
        });
    }
}
module.exports = idAvatar;