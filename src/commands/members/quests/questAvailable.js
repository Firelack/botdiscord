function questAvailable(message, clanId, axios, headers) {
// Quest available for a clan
    if (message.content.toLowerCase().startsWith("quest")) {
          console.log("commande detecte:");

      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/available`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;
          console.log("Réponse reçue:", responseData);

          // Loop through each quest in the response
          for (const quest of responseData) {
            // Fetch necessary information
            const promoImageUrl = quest.promoImageUrl;
            const purchasableWithGems = quest.purchasableWithGems;
            const questId = quest.id;

            // Create new URL
            const nouvelleExtension = "@3x.jpg";
            const newurl = promoImageUrl.replace(".jpg", nouvelleExtension);

            // Determine currency for purchase
            const currency = purchasableWithGems ? "Gemmes" : "Or";

            axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/votes`, {
              headers: headers,
              params: {
                questId: questId
              }
            })
              .then(response => {
                const responseData = response.data;
                const voteCount = responseData.votes[questId].length;

                // Send message with quest details
                message.reply(`**__Type d'achat:__** ${currency}\n**__Nombre de votes:__** ${voteCount}\n**__Image quête actuelle:__** [lien](${newurl})`);
              })
              .catch(error => {
                message.reply("Une erreur s'est produite lors de la requête.");
                console.error(error);
              });
          }
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
}
module.exports = questAvailable;