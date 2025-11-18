/**
 * Fetches and replies with avatar information based on a provided avatar ID.
 * @param {Object} message - The message object containing user input.
 * @param {Object} axios - The axios instance for making HTTP requests.
 * @param {Object} headers - The headers to include in the HTTP request.
 * @returns {void}
 */
function idAvatar(message, axios, headers) {
// Fetch avatar ID
    if (message.content.toLowerCase().startsWith("idavatar:")) {
      var sharedAvatarId = message.content.substring(9).trim();

      axios.get(`https://api.wolvesville.com/avatars/${sharedAvatarId}`, {
        headers: headers
      })
        .then(response => {
          const data = response.data;
          const selectedInfo = {
            "id": data.id,
            "url": data.avatar.url
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