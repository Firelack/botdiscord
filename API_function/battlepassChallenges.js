function battlepassChallenges(message, axios, headers) {
// Challenge actif du battle pass
    if (message.content.toLowerCase().startsWith("battlepass")) {
      axios.get('https://api.wolvesville.com/battlePass/challenges', {
        headers: headers
      })
        .then(response => {
          const challenges = response.data;

          // Filtrer les challenges en cours
          const currentChallenges = challenges.filter(challenge => {
            const startTime = new Date(challenge.startTime).getTime();
            const endTime = startTime + challenge.durationInDays * 24 * 60 * 60 * 1000;
            const currentTime = new Date().getTime();
            return currentTime >= startTime && currentTime <= endTime;
          });

          // Construire la réponse avec les informations demandées
          const responseText = currentChallenges.map(challenge => {
            const startTime = new Date(challenge.startTime);
            const endTime = new Date(startTime.getTime() + challenge.durationInDays * 24 * 60 * 60 * 1000);
            const timeRemaining = endTime - new Date();

            // Formatage de la date en français
            const formattedStartDate = startTime.toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            // Vérifier si le prix en or est défini
            const goldReward = challenge.rewardInGold !== undefined ? `**Récompense en or :** ${challenge.rewardInGold}` : '';

            // Construction de la réponse en excluant la catégorie "Récompense en or" si elle n'est pas définie
            return `**Description :** ${challenge.description}\n${goldReward ? goldReward + '\n' : ''}**Date de début :** ${formattedStartDate}\n**Durée restante :** ${Math.floor(timeRemaining / (24 * 60 * 60 * 1000))} jours`;
          }).join('\n\n');

          message.reply(responseText);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
}
module.exports = battlepassChallenges;