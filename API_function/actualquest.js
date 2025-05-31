
function actualquest(message, clanId, axios, headers ) {
// Quête actuelle du clan werewolf online
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

          // Extraire les composants de la date
          const [year, month, day, time] = selectedInfo.tierStartTime.split(/[-T:.Z]/);

          // Liste des participants
          const participants = responseData.participants.map(participant => {
            return {
              username: participant.username,
              xp: participant.xp
            };
          });

          // Tri des participants par XP dans l'ordre décroissant
          participants.sort((a, b) => b.xp - a.xp);

          message.reply(`**__Date de lancement de l'étape actuelle :__** ${day}/${month}/${year} à ${time}h\n**__Participants:__**\n${participants.map(p => `- ${p.username}: ${p.xp} XP`).join('\n')}\n\n**__Image quête actuelle:__** [lien](${newurl})`);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête, peut être qu'aucune quête n'est en cours.");
          console.error(error);
        });
    }
}
module.exports = actualquest;