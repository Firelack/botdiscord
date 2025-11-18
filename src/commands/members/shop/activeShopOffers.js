/**
 * Handles the "offres" command to fetch and display active shop offers.
 * @param {Object} message - The message object from the chat.
 * @param {Object} axios - The axios instance for making HTTP requests.
 * @param {Object} headers - The headers to include in the HTTP request.
 * @returns {void}
 */
function activeShopOffers(message, axios, headers) {
// Active shop offers
    if (message.content.toLowerCase() === "offres") {
      axios.get("https://api.wolvesville.com/shop/activeOffers", {
        headers: headers,
      })
        .then(response => {
          const activeOffers = response.data;

          // Filter offers with a non-null image URL
          const offersWithImage = activeOffers.filter(offer => offer.promoImageUrl);

          if (offersWithImage.length > 0) {
            offersWithImage.forEach(offer => {
              // Format the date in French with date and time
              const formattedDate = new Intl.DateTimeFormat('fr-FR', {
                dateStyle: 'full',
                timeStyle: 'short',
              }).format(new Date(offer.expireDate));

              const imageUrl = offer.promoImageUrl.replace(".jpg", "@3x.jpg");

              let messageText = `Type: ${offer.type}\n`;
              messageText += `Date d'expiration: ${formattedDate}\n`;
              messageText += `Prix: ${offer.costInGems} gemmes\n`;
              messageText += `Image URL: [lien](${imageUrl})\n\n`;

              // Send the message with the image URL as a clickable link
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