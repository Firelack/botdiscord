function playerStats(message, axios, headers) {
// Stats of a player
    if (message.content.toLowerCase().startsWith("stats:")) {
      const profilName = message.content.substring(6).trim();

      axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;
          const gameStats = responseData.gameStats;
          const username = responseData.username;

          // Build a string representation of the game stats
          const gameStatsString = `**Statistiques de jeu pour ${username}:**\n` +
            `Parties gagnées: ${gameStats.totalWinCount}\n` +
            `Parties perdues: ${gameStats.totalLoseCount}\n` +
            `Parties égalées: ${gameStats.totalTieCount}\n` +
            `Parties en tant que Villageois gagnées: ${gameStats.villageWinCount}\n` +
            `Parties en tant que Villageois perdues: ${gameStats.villageLoseCount}\n` +
            `Parties en tant que Loup-Garou gagnées: ${gameStats.werewolfWinCount}\n` +
            `Parties en tant que Loup-Garou perdues: ${gameStats.werewolfLoseCount}\n` +
            `Parties de vote gagnées: ${gameStats.votingWinCount}\n` +
            `Parties de vote perdues: ${gameStats.votingLoseCount}\n` +
            `Parties solo gagnées: ${gameStats.soloWinCount}\n` +
            `Parties solo perdues: ${gameStats.soloLoseCount}\n` +
            `Nombre de suicides: ${gameStats.exitGameBySuicideCount}\n` +
            `Nombre de morts après la partie: ${gameStats.exitGameAfterDeathCount}\n` +
            `Temps total de jeu (en minutes): ${gameStats.totalPlayTimeInMinutes}`;

          message.reply(gameStatsString);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête, peut être que les stats de ce joueurs sont privées ou que le joueur n'existe pas.");
          console.error(error);
        });
    }
}
module.exports = playerStats;