/**
 * Fetches and displays the clan ID when the "idclan:" command is triggered.
 * @param {Object} message - The message object from Discord.
 * @param {Object} axios - The axios instance for making HTTP requests.
 * @param {Object} headers - The headers to include in the HTTP request.
 * @returns {void}
 */
function getClanId(message, axios, headers) {
// Fetch clan ID
    if (message.content.toLowerCase().startsWith("idclan:")) {
      const clanName = message.content.substring(7).trim();

      axios.get(`https://api.wolvesville.com/clans/search?name=${clanName}`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data[0];
          const selectedInfo = {
            "id": responseData.id,
          };
          message.reply(`Id du clan ${clanName} : ${selectedInfo.id}`);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
}
module.exports = getClanId;