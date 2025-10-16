let ok = true; // Flag to control message sending

function checkQuestStatus(client, clanId, questChannelId, axios, headers) {
  const channel = client.channels.cache.get(questChannelId);
  if (!channel) {
    console.error(`Le salon avec l'ID ${questChannelId} est introuvable.`);
    return;
  }

  axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/active`, {
    headers: headers
  })
    .then(response => {
      const quest = response.data?.quest;
      const tierFinished = response.data?.tierFinished;

      if (!quest) {
        if (ok) {
          channel.send("Aucune quête n'est actuellement active pour le clan.");
          ok = false;
        }
        return;
      }

      if (tierFinished) {
        if (ok) {
          channel.send("L'étape actuelle de la quête est terminée");
          ok = false;
        }
        return;
      }

      ok = true; // Reset ok if everything is normal
    })
    .catch(error => {
      if (ok) {
        channel.send("La quête actuelle est terminée !");
        ok = false;
      }
      console.error("Erreur lors de la récupération de la quête :", error.response?.status, error.message);
    });
}

module.exports = checkQuestStatus;