function playerCards(message, axios, headers) {
  // Card of a player
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
          // Base role
          let roleString = `**${card.roleIdBase}:** ${card.rarity}`;

          // All advanced roles if any
          if (Array.isArray(card.roleIdsAdvanced) && card.roleIdsAdvanced.length > 0) {
            const advancedRoles = card.roleIdsAdvanced.map(role => `**${role}**`).join(' / ');
            roleString += ` / Rôles avancés: ${advancedRoles}`;
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