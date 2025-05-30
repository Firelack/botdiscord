const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = function createCheckClanChat(client, clanId, salonId, accessToken) {
  const filePath = path.join(__dirname, "lastSeen.json");
  const playerNameCache = {}; // ✅ Cache pour éviter de surcharger l’API

  // Charger la dernière date depuis le fichier
  let lastSeenDate = null;
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    lastSeenDate = data.lastSeenDate ? new Date(data.lastSeenDate) : null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bot ${accessToken}`
  };

  return async function checkClanChat() {
    try {
      const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/chat`, {
        headers: headers
      });

      const messages = response.data;
      const channel = await client.channels.fetch(salonId);
      const sortedMessages = messages.slice(-10).reverse();
      let newLastSeen = lastSeenDate;

      for (const msg of sortedMessages) {
        if (msg.isSystem) continue;
        if (msg.playerBotOwnerUsername === "BOT(Firelack)") continue;

        const msgDate = new Date(msg.date);
        if (!lastSeenDate || msgDate > lastSeenDate) {
          const playerId = msg.playerId;

          // 🔍 Récupération du pseudo via le cache ou l’API
          let username = "Inconnu";
          if (playerNameCache[playerId]) {
            username = playerNameCache[playerId];
          } else {
            try {
              const playerResponse = await axios.get(`https://api.wolvesville.com/players/${playerId}`, {
                headers: headers
              });
              username = playerResponse.data.username;
              playerNameCache[playerId] = username;
            } catch (e) {
              console.error(`Erreur lors de la récupération du joueur ${playerId}:`, e.message);
            }
          }

          await channel.send(`${username}: ${msg.msg}`);

          if (!newLastSeen || msgDate > newLastSeen) {
            newLastSeen = msgDate;
          }
        }
      }

      if (newLastSeen && (!lastSeenDate || newLastSeen > lastSeenDate)) {
        lastSeenDate = newLastSeen;
        fs.writeFileSync(filePath, JSON.stringify({ lastSeenDate: lastSeenDate.toISOString() }, null, 2));
      }

    } catch (error) {
      console.error("Erreur en récupérant le chat du clan:", error.message);
    }
  };
};
