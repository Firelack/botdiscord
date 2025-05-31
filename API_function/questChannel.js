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
        channel.send("Aucune quête n'est actuellement active pour le clan.");
      }
      // Tu peux ajouter un else pour logguer que la quête est active si tu veux
    })
    .catch(error => {
      channel.send("La quête ou l'étape actuelle est terminée !");
      console.error("Erreur lors de la récupération de la quête :", error.response?.status, error.message);
    });
}

module.exports = checkQuestStatus;