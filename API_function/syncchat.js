// syncchat.js

const playerNameCache = {};
let lastSeenDate = null;
let initialized = false;

async function smartReplaceMentions(guild, messageText) {
  const mentionRegex = /@([^\s@]+)/g;
  const matches = [...messageText.matchAll(mentionRegex)];
  if (!matches.length) return messageText;

  let replaced = messageText;

  for (const match of matches) {
    const rawMatch = match[0];
    const pseudo = match[1];
    let replacement = rawMatch;

    try {
      let member = guild.members.cache.find(m => m.nickname === pseudo);

      if (!member) {
        member = guild.members.cache.find(
          m => m.user.username === pseudo && !m.nickname
        );
      }

      if (member) {
        replacement = `<@${member.id}>`;
      }

      replaced = replaced.split(rawMatch).join(replacement);
    } catch (err) {
      console.warn(`⚠️ Erreur lors de la tentative de tag ${pseudo} :`, err.message);
    }
  }

  return replaced;
}

async function checkClanChat(client, clanId, salonId, axios, headers) {
  try {
    const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/chat`, { headers });
    const messages = response.data;
    if (!messages.length) return;

    const channel = await client.channels.fetch(salonId);
    if (!channel || !channel.isTextBased()) {
      console.error("❌ Salon introuvable ou non textuel.");
      return;
    }

    const guild = channel.guild;
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

      // ✅ Remplacer les @pseudo dans le message du jeu
      let formattedMessage;
      try {
        formattedMessage = await smartReplaceMentions(guild, msg.msg);
      } catch (err) {
        console.error("❌ Erreur remplacement mentions :", err);
        formattedMessage = msg.msg; // On continue quand même
      }

      try {
        await channel.send(`${username}: ${formattedMessage}`);
      } catch (err) {
        console.error("❌ Erreur lors de l'envoi dans le salon :", err);
      }

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
    let content = message.content;

    // Si message contient des mentions, on remplace par @pseudo
    if (message.mentions.users.size > 0) {
      for (const [id, user] of message.mentions.users) {
        // Récupérer le membre complet pour displayName
        const member = message.guild ? await message.guild.members.fetch(id) : null;
        const displayName = member ? member.displayName : user.username;

        // Construire la mention Discord possible (avec ou sans le !)
        const mentionRegex = new RegExp(`<@!?${id}>`, 'g');

        // Remplacer la mention par @displayName
        content = content.replace(mentionRegex, `@${displayName}`);
      }
    }

    const displayNameAuthor = message.member?.displayName || message.author.username;
    await sendToWolvesville(displayNameAuthor, content, clanId, axios, headers);
  }
}


module.exports = {
  checkClanChat,
  sendToWolvesville,
  handleDiscordMessage
};