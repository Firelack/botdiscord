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

    axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
      headers: headers
    })
      .then(response => {
        const userId = response.data.id;

        return axios.put(`https://api.wolvesville.com/clans/${clanId}/members/${userId}/flair`, {
          flair: nouveauFlair
        }, {
          headers: headers
        });
      })
      .then(() => {
        if (nouveauFlair === "") {
          message.reply(`Le titre de ${profilName} a été supprimé ✅`);
        } else {
          message.reply(`Le titre de ${profilName} a été changé en : **${nouveauFlair}** ✅`);
        }
      })
      .catch(error => {
        console.error(error);
        message.reply("Une erreur s'est produite lors du changement de titre.");
      });
  }
}

module.exports = changerFlair;
