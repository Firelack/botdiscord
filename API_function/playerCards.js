function playerCards(message, axios, headers) {
// Cartes d'un joueur
    if (message.content.toLowerCase().startsWith("cartes:")) {
      const profilName = message.content.substring(7).trim();

      axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;
          const selectedInfo = {
            "roleCards": responseData.roleCards,
            "username": responseData.username,
          };

          // Build a string representation of the role cards
          const roleCardsString = selectedInfo.roleCards.map(card => {
            let roleString = `**${card.roleId1}:** ${card.rarity}`;
            if (card.roleId2) {
              roleString += ` / **${card.roleId2}:** ${card.rarity}`;
            }
            return roleString;
          }).join('\n');

          message.reply(`# Cartes de ${selectedInfo.username}\n**__Cartes:__**\n${roleCardsString}`);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
  }
module.exports = playerCards;