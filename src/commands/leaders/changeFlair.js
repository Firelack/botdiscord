const findPlayer = require('../../utils/findPlayer.js');

async function processNameAndFlairChange(message, clanId, salonId, axios, headers, profilName, nouveauFlair) {
  const searchResult = await findPlayer(profilName, clanId, axios, headers);

  let matchToProcess = null;
  let resultMessage = null;

  if (searchResult.unique) {
    matchToProcess = searchResult.unique;
  } else if (searchResult.ambiguous) {
    // Only one ambiguity case here since we process one name at a time
    const usernames = searchResult.matches.map(m => m.username).join(', ');
    resultMessage = `⚠️ Surnom ambigu ("${profilName}" correspond à plusieurs joueurs : ${usernames}). Veuillez être plus spécifique.`;
  } else if (searchResult.error) {
    resultMessage = searchResult.error;
  }

  if (matchToProcess) {
    const { userId, username } = matchToProcess;

    try {
      await axios.put(`https://api.wolvesville.com/clans/${clanId}/members/${userId}/flair`, {
        flair: nouveauFlair
      }, {
        headers: headers
      });
      
      if (nouveauFlair === "") {
        resultMessage = `Le titre de ${username} a été supprimé ✅`;
      } else {
        resultMessage = `Le titre de ${username} a été changé en : **${nouveauFlair}** ✅`;
      }
    } catch (error) {
      console.error(error);
      resultMessage = `❌ Erreur lors du changement de titre pour ${username}.`;
    }
  }

  if (resultMessage) {
    message.reply(resultMessage);
  }
}

async function changerFlair(message, clanId, salonId, axios, headers) {
  if (message.channel.id !== salonId) return;

  // Command : titre:NomDuJoueur[:NouveauTitre]
  if (message.content.toLowerCase().startsWith("titre:")) {
    const contenu = message.content.substring(6).trim(); // delete "titre:" and trim spaces
    const premierDeuxPoints = contenu.indexOf(":");

    let profilName, nouveauFlair;

    if (premierDeuxPoints === -1) {
      // No new flair provided, just remove existing flair
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

    await processNameAndFlairChange(message, clanId, salonId, axios, headers, profilName, nouveauFlair);
  }
}

module.exports = changerFlair;