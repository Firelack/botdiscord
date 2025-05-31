function roleRotations(message, axios, headers) {
// Rôle Rotations
    if (message.content.toLowerCase().startsWith("rolerotations:")) {
      // Extraire le mode de jeu de la commande
      let gameModeInput = message.content.substring("rolerotations:".length).trim().toLowerCase();
      let gameMode;

      // Mapping for custom inputs
      const customInputsMapping = {
        rapide: "quick",
        sérieuse: "advanced",
        gold: "ranked-league-gold",
        silver: "ranked-league-silver",
      };

      // Check if the custom input is mapped
      if (customInputsMapping.hasOwnProperty(gameModeInput)) {
        gameMode = customInputsMapping[gameModeInput];
      } else {
        // If not a custom input, use the provided input as is
        gameMode = gameModeInput;
      }

      // Vérifier si le mode de jeu est valide
      const validGameModes = ["ranked-league-silver", "ranked-league-gold", "sandbox", "advanced", "quick"];
      if (validGameModes.includes(gameMode)) {
        // Effectuer une requête pour obtenir les rotations de rôles pour le mode de jeu spécifié
        axios.get(`https://api.wolvesville.com/roleRotations`, {
          headers: headers
        })
          .then(response => {
            const roleRotations = response.data;

            // Rechercher les rotations de rôles pour le mode de jeu spécifié
            const selectedRotation = roleRotations.find(rotation => rotation.gameMode === gameMode);

            if (selectedRotation) {
              const rolesInfo = selectedRotation.roleRotations.map(roleInfo => {
                const roles = roleInfo.roleRotation.roles.map(role => {
                  return Array.isArray(role) ? role[0].role : role.role;
                }).join(", ");
                return `**__Probabilité:__ ${roleInfo.probability}**\n${roles}`;
              }).join("\n");

              message.reply(`**Mode de jeu: ${gameMode}**\n${rolesInfo}`);
            } else {
              message.reply("Aucune rotation de rôle trouvée pour le mode de jeu spécifié.");
            }
          })
          .catch(error => {
            message.reply("Une erreur s'est produite lors de la requête.");
            console.error(error);
          });
      } else {
        message.reply("Mode de jeu invalide. Les modes valides sont: ranked-league-silver, ranked-league-gold, sandbox, advanced, quick (ou rapide, sérieuse, silver et gold).");
      }
    }
}
module.exports = roleRotations;