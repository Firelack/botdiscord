// syncchat.js

const playerNameCache = {};
let lastSeenDate = null;
let initialized = false;

async function checkClanChat(client, clanId, salonId, axios, headers) {
  try {
    const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/chat`, { headers });
    const messages = response.data;
    if (!messages.length) return;

    const channel = await client.channels.fetch(salonId);
    const sortedMessages = messages.reverse();

    if (!initialized) {
      const lastMsgDate = new Date(sortedMessages[sortedMessages.length - 1].date);
      lastSeenDate = new Date(lastMsgDate.getTime() - 1000);
      initialized = true;
      console.log(`Initialisation lastSeenDate à ${lastSeenDate.toISOString()} (1 sec avant dernier message)`);
    }

    let newLastSeen = lastSeenDate;

    for (const msg of sortedMessages) {
      if (msg.isSystem || msg.playerBotOwnerUsername === "BOT(Firelack)") continue;

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
          console.error(`Erreur joueur ${playerId}:`, e.message);
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
    console.error("Erreur chat clan:", error.message);
  }
}

async function sendToWolvesville(authorName, content, clanId, axios, headers) {
  try {
    await axios.post(
      `https://api.wolvesville.com/clans/${clanId}/chat`,
      { message: `${authorName} : ${content}` },
      { headers }
    );
  } catch (error) {
    console.error("Erreur envoi message Wolvesville :", error.message);
  }
}

function shouldSendToWolvesville(message, salonId) {
  const discordEmojiRegex = /<a?:\w+:\d+>/g;

  return (
    !message.author.bot &&
    !discordEmojiRegex.test(message.content) &&
    message.channel.id === salonId &&
    message.attachments.size === 0 &&
    message.stickers.size === 0 &&
    message.embeds.length === 0
  );
}

async function handleDiscordMessage(message, clanId, salonId, axios, headers) {
  if (shouldSendToWolvesville(message, salonId)) {
    const displayName = message.member?.displayName || message.author.username;
    await sendToWolvesville(displayName, message.content, clanId, axios, headers);
  }
}

module.exports = {
  checkClanChat,
  sendToWolvesville,
  handleDiscordMessage
};