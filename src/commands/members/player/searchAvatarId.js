/**
 * Fetches and replies with avatar ID based on a provided profile name and slot number.
 * @param {Object} message - The message object containing user input.
 * @param {Object} axios - The axios instance for making HTTP requests.
 * @param {Object} headers - The headers to include in the HTTP request.
 * @returns {void}
 */
function searchAvatarId(message, axios, headers) {
// Fetch avatar ID of a avatar in a specific slot for a player
    if (message.content.toLowerCase().startsWith("searchid:")) {
      // Extract player name and slot number
      const contentArray = message.content.substring(9).trim().split(" ");

      // Ensure there is at least one element after "searchid:"
      if (contentArray.length > 0) {
        const profilName = contentArray[0];

        // Check if a slot number is provided
        const slotNumber = contentArray.length > 1 ? contentArray[1] : null;

        // Declare resp outside the scope of the second Axios request
        let avatarUrl;
        let resp;

        axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
          headers: headers
        })
          .then(response => {
            const responseData = response.data;
            const selectedInfo = {
              "id": responseData.id,
              "username": responseData.username,
              "avatar": responseData.avatars[slotNumber-1].url
            };
            const nouvelleExtension = "@3x.png";
            avatarUrl = selectedInfo.avatar.replace(".png", nouvelleExtension);

            // Return the promise of the second Axios request
            return axios.get(`https://api.wolvesville.com/avatars/sharedAvatarId/${responseData.id}/${slotNumber-1}`, {
              headers: headers
            });
          })
          .then(response => {
            resp = response.data;
            // RRespond here after both requests have succeeded
            message.reply(`**__Avatar demandé:__** [Avatar](${avatarUrl})\n**__Avatar id:__** ${resp}`);
          })
          .catch(error => {
            message.reply("Une erreur s'est produite lors de la requête, vérifier les informations fournies.");
            console.error(error);
          });
      } else {
        // Handle case where no player name is provided
        console.log("Aucun nom de joueur fourni après 'searchid:'");
      }
    }
}
module.exports = searchAvatarId;