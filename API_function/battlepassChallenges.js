function battlepassChallenges(message, axios, headers) {
// Battlepass active challenges
    if (message.content.toLowerCase().startsWith("battlepass")) {
      axios.get('https://api.wolvesville.com/battlePass/challenges', {
        headers: headers
      })
        .then(response => {
          const challenges = response.data;

          // Filter current challenges
          const currentChallenges = challenges.filter(challenge => {
            const startTime = new Date(challenge.startTime).getTime();
            const endTime = startTime + challenge.durationInDays * 24 * 60 * 60 * 1000;
            const currentTime = new Date().getTime();
            return currentTime >= startTime && currentTime <= endTime;
          });

          // Build the response with the requested information
          const responseText = currentChallenges.map(challenge => {
            const startTime = new Date(challenge.startTime);
            const endTime = new Date(startTime.getTime() + challenge.durationInDays * 24 * 60 * 60 * 1000);
            const timeRemaining = endTime - new Date();

            // Format the date in French
            const formattedStartDate = startTime.toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            // Check if the gold reward is defined
            const goldReward = challenge.rewardInGold !== undefined ? `**Récompense en or :** ${challenge.rewardInGold}` : '';

            // Construction of the response string
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