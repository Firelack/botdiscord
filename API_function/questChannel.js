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
      if (!response.data || !response.data.quest) {
        if (ok) {
          channel.send("Aucune quête n'est actuellement active pour le clan.");
          ok = false; // Bloquer jusqu'à prochaine quête active
        }
      } else {
        ok = true; // Remettre ok à true si une quête est active
      }
    })
    .catch(error => {
      // Si l’API renvoie une erreur, on considère que la quête est terminée
      if (ok) {
        channel.send("La quête ou l'étape actuelle est terminée !");
        ok = false; // Bloquer jusqu'à prochaine quête active
      }
      console.error("Erreur lors de la récupération de la quête :", error.response?.status, error.message);
    });
}

module.exports = checkQuestStatus;