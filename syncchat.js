const axios = require("axios");

module.exports = function createCheckClanChat(client, clanId, salonId, accessToken) {
  const playerNameCache = {};
  let lastSeenDate = null;
  let initialized = false;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bot ${accessToken}`
  };

  return async function checkClanChat() {
    try {
      const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/chat`, { headers });

      const messages = response.data;
      if (!messages.length) return;

      const channel = await client.channels.fetch(salonId);
      const sortedMessages = messages.reverse();

      // Première exécution : on initialise lastSeenDate à la date du dernier message moins 1 seconde
      if (!initialized) {
        const lastMsgDate = new Date(sortedMessages[sortedMessages.length - 1].date);
        lastSeenDate = new Date(lastMsgDate.getTime() - 1000); // -1 sec
        initialized = true;
        console.log(`Initialisation lastSeenDate à ${lastSeenDate.toISOString()} (1 sec avant dernier message)`);
      }

      let newLastSeen = lastSeenDate;

      for (const msg of sortedMessages) {
        if (msg.isSystem) continue;
        if (msg.playerBotOwnerUsername === "BOT(Firelack)") continue;

        const msgDate = new Date(msg.date);
        if (msgDate <= lastSeenDate) continue;

        const playerId = msg.playerId;

        let username = playerNameCache[playerId];
        if (!username) {
          try {
            const playerResponse = await axios.get(`https://api.wolvesville.com/players/${playerId}`, { headers });
            username = playerResponse.data.username;
            playerNameCache[playerId] = username;
          } catch (e) {
            console.error(`Erreur lors de la récupération du joueur ${playerId}:`, e.message);
            username = "Inconnu";
          }
        }

        await channel.send(`${username}: ${msg.msg}`);

        if (msgDate > newLastSeen) {
          newLastSeen = msgDate;
        }
      }

      if (newLastSeen > lastSeenDate) {
        lastSeenDate = newLastSeen;
      }

    } catch (error) {
      console.error("Erreur en récupérant le chat du clan:", error.message);
    }
  };
};
