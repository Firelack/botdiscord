function avatarPlayer(message, axios, headers) { 
  // Tout les avatars ou un avatars en particulier d'un joueur
  if (message.content.toLowerCase().startsWith("avatar:")) {
    const profilNameWithNumber = message.content.substring(7).trim();

    // Utiliser une expression régulière pour vérifier si le message se termine par un espace puis un nombre
    const match = profilNameWithNumber.match(/^(.*) (\d+)$/);

    if (match) {
      const profilName = match[1].trim();
      const number = parseInt(match[2], 10);

      axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;
          const avatars = responseData.avatars;
          const nouvelleExtension = "@3x.png";

          if (!isNaN(number) && number >= 1 && number <= avatars.length) {
            const avatarUrl = avatars[number - 1].url.replace(".png", nouvelleExtension);
            message.reply(`**__Avatar ${number} de ${profilName}:__**\n[Lien vers l'avatar](${avatarUrl})`);
          } else {
            message.reply(`Numéro d'avatar invalide pour ${profilName}. Veuillez choisir un numéro entre 1 et ${avatars.length}`);
          }
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    } else {
      const profilName = profilNameWithNumber;

      // Utiliser Axios pour effectuer la requête HTTP pour les avatars
      axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;
          const avatars = responseData.avatars;
          const nouvelleExtension = "@3x.png";
          const avatarUrls = avatars.map((avatar, index) => {
            const url = avatar.url.replace(".png", nouvelleExtension);
            return `!([Avatar ${index + 1}](${url}))`;
          });

          if (avatarUrls.length <= 12) {
            const formattedAvatars = avatarUrls.map(url => `> - ${url}`);
            message.reply(`**__Avatars de ${profilName}:__**\n${formattedAvatars.join('\n')}`);
          } else {
            // Diviser en groupes de 12 avatars maximum
            const chunkSize = 12;
            for (let i = 0; i < avatarUrls.length; i += chunkSize) {
              const chunk = avatarUrls.slice(i, i + chunkSize);
              const startIndex = i + 1;
              const endIndex = i + chunk.length;
              message.reply(`**__Avatars de ${profilName} (${startIndex}-${endIndex}):__**\n${chunk.join('\n')}`);
            }
          }
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
  }
}
module.exports = avatarPlayer;
