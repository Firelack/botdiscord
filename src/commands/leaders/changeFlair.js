const searchMember = require('../../utils/searchMember.js'); // ADDED

function changerFlair(message, clanId, salonId, axios, headers) {
  if (message.channel.id !== salonId) return;

  // Command : titre:NomDuJoueur[:NouveauTitre]
  if (message.content.toLowerCase().startsWith("titre:")) {
    const contenu = message.content.substring(6).trim(); // delete "titre:" and trim spaces
    const premierDeuxPoints = contenu.indexOf(":");

    let profilName, nouveauFlair;

    if (premierDeuxPoints === -1) {
      // No new flair provided, remove flair
      profilName = contenu;
      nouveauFlair = "";
    } else {
      profilName = contenu.substring(0, premierDeuxPoints).trim();
      nouveauFlair = contenu.substring(premierDeuxPoints + 1).trim();
    }

    if (!profilName) {
      message.reply("Format invalide. Utilise : `titre:NomDuJoueur[:Titre]`");
      return;
    }

    searchMember(profilName, clanId, axios, headers) // REPLACED search
      .then(result => {
        if (result.error) {
          message.reply(result.error);
          return null; // Stop the promise chain
        }
        const { userId, username } = result;

        return axios.put(`https://api.wolvesville.com/clans/${clanId}/members/${userId}/flair`, {
          flair: nouveauFlair
        }, {
          headers: headers
        })
        .then(() => username) // Pass username to the next then block
        .catch(error => {
          console.error(error);
          message.reply(`❌ Erreur lors du changement de titre pour ${username}.`);
          return null; // Stop the promise chain
        });
      })
      .then(username => {
        if (username) {
          if (nouveauFlair === "") {
            message.reply(`Le titre de ${username} a été supprimé ✅`);
          } else {
            message.reply(`Le titre de ${username} a été changé en : **${nouveauFlair}** ✅`);
          }
        }
      })
      .catch(error => {
        // This catch is for any unexpected error not handled by searchMember or the put request's inner catch
        console.error("Erreur inattendue dans changerFlair:", error);
      });
  }
}

module.exports = changerFlair;