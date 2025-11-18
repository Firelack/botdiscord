/**
 * gets the actual quest of a clan and replies with details
 * @param {object} message - The message object from Discord
 * @param {string} clanId - The ID of the clan
 * @param {object} axios - The axios instance for making HTTP requests
 * @param {object} headers - The headers for the HTTP request
 * @returns {void}
 */
function actualQuest(message, clanId, axios, headers ) {
// Actual quest of a clan
    if (message.content.toLowerCase().startsWith("actualquest")) {
      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/active`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;
          const selectedInfo = {
            "url": responseData.quest.promoImageUrl,
            "tierStartTime": responseData.tierStartTime,
          };
          const nouvelleExtension = "@3x.jpg";
          const newurl = selectedInfo.url.replace(".jpg", nouvelleExtension);

          // Extract date components
          const [year, month, day, time] = selectedInfo.tierStartTime.split(/[-T:.Z]/);

          // List of participants
          const participants = responseData.participants.map(participant => {
            return {
              username: participant.username,
              xp: participant.xp
            };
          });

          // Sort participants by XP in descending order
          participants.sort((a, b) => b.xp - a.xp);

          message.reply(`**__Date de lancement de l'étape actuelle :__** ${day}/${month}/${year} à ${time}h\n**__Participants:__**\n${participants.map(p => `- ${p.username}: ${p.xp} XP`).join('\n')}\n\n**__Image quête actuelle:__** [lien](${newurl})`);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête, peut être qu'aucune quête n'est en cours.");
          console.error(error);
        });
    }
}
module.exports = actualQuest;