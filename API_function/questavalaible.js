function questAvailable(message, clanId, headers, axios) {
// Quest disponible du clan werewolf online
    if (message.content.toLowerCase().startsWith("quest")) {
      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/available`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;

          // Parcourir le tableau d'objets
          for (const quest of responseData) {
            // Récupérer les informations nécessaires
            const promoImageUrl = quest.promoImageUrl;
            const purchasableWithGems = quest.purchasableWithGems;
            const questId = quest.id;

            // Créer le nouveau URL
            const nouvelleExtension = "@3x.jpg";
            const newurl = promoImageUrl.replace(".jpg", nouvelleExtension);

            // Déterminer la devise pour l'achat
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

                // Envoyer le message avec les détails de la quête
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