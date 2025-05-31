
function activeShopOffers(message, axios, headers) {
// Offre active du shop
    if (message.content.toLowerCase() === "offres") {
      axios.get("https://api.wolvesville.com/shop/activeOffers", {
        headers: headers,
      })
        .then(response => {
          const activeOffers = response.data;

          // Filtrer les offres avec une URL d'image non nulle
          const offersWithImage = activeOffers.filter(offer => offer.promoImageUrl);

          if (offersWithImage.length > 0) {
            offersWithImage.forEach(offer => {
              // Formatter la date en format français avec date et heure
              const formattedDate = new Intl.DateTimeFormat('fr-FR', {
                dateStyle: 'full',
                timeStyle: 'short',
              }).format(new Date(offer.expireDate));

              const imageUrl = offer.promoImageUrl.replace(".jpg", "@3x.jpg");

              let messageText = `Type: ${offer.type}\n`;
              messageText += `Date d'expiration: ${formattedDate}\n`;
              messageText += `Prix: ${offer.costInGems} gemmes\n`;
              messageText += `Image URL: [lien](${imageUrl})\n\n`;

              // Envoyer un message distinct pour chaque offre
              message.reply(`**__Offres actives:__**\n${messageText}`);
            });
          } else {
            message.reply("Pas d'offre active trouvée");
          }
        })
        .catch(error => {
          console.error("Error making the request:", error);
          message.reply("Une erreur s'est produite lors de la requête.");
        });
    }
}
module.exports = activeShopOffers;