let ok = true; // Variable de contrôle initialisée à true (en dehors de la fonction)

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

      if (!quest) {
        if (ok) {
          channel.send("Aucune quête n'est actuellement active pour le clan.");
          ok = false;
        }
        return;
      }

      if (quest.tierFinished) {
        if (ok) {
          channel.send("L'étape actuelle de la quête est terminée");
          ok = false;
        }
        return;
      }

      ok = true; // Réinitialiser ok si tout est normal
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