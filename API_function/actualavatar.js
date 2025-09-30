    // Actual avatar of a player
function actualAvatar(message, axios, headers) {
    if (message.content.toLowerCase().startsWith("actualavatar:")) {
      const profilName = message.content.substring(13).trim();

      axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;
          const selectedInfo = {
            "equippedAvatar": responseData.equippedAvatar.url,
            "username": responseData.username,
          };
          const nouvelleExtension = "@3x.png";
          const avatarUrl = selectedInfo.equippedAvatar.replace(".png", nouvelleExtension);

          message.reply(`**__Username:__** ${selectedInfo.username}\n**__Avatar actuel:__** [Lien de l'avatar](${avatarUrl})`);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
}
module.exports = actualAvatar;