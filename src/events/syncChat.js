const supabase = require('../utils/superbaseClient');
const playerNameCache = {};

// Cache en mémoire pour la date du dernier message, pour ce clan uniquement.
let lastSeenDate = new Date(0); 

/**
 * Load the last seen chat timestamp from the database for a specific clan.
 * @param {string} clanId - The ID of the clan.
 */
async function loadLastSeenDateFromDB(clanId) {
  if (!clanId) return;

  let { data, error } = await supabase
    .from('bot_state')
    .select('value')
    .eq('key', 'last_chat_timestamp')
    .eq('clan_id', clanId) // Load for this specific clan
    .single();
  
  if (data && data.value) {
    lastSeenDate = new Date(data.value);
    console.log(`📂 Timestamp chat restauré depuis DB pour ${clanId}: ${lastSeenDate.toISOString()}`);
  } else {
    // If no timestamp found, initialize to 30 seconds ago
    lastSeenDate = new Date(Date.now() - 30000); 
    console.warn(`Aucun timestamp chat en DB pour ${clanId}. Initialisé à : ${lastSeenDate.toISOString()}`);
    // Write this initial value back to the DB
    await supabase.from('bot_state').upsert({ 
      key: 'last_chat_timestamp', 
      value: lastSeenDate.toISOString(),
      clan_id: clanId
    });
  }
}

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
    let newLastSeen = lastSeenDate;
    let newMessagesFound = false;

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
          username = "Inconnu";
        }
      }

      let formattedMessage;
      try {
        formattedMessage = await smartReplaceMentions(guild, msg.msg);
      } catch (err) {
        formattedMessage = msg.msg;
      }

      try {
        await channel.send(`${username}: ${formattedMessage}`);
      } catch (err) {
        console.error("❌ Erreur lors de l'envoi dans le salon :", err);
      }

      if (msgDate > newLastSeen) {
        newLastSeen = msgDate;
      }
      newMessagesFound = true;
    }

    if (newMessagesFound) {
      lastSeenDate = newLastSeen; // Update in-memory timestamp
      
      // Update in DB
      await supabase.from('bot_state').upsert({ 
        key: 'last_chat_timestamp', 
        value: lastSeenDate.toISOString(),
        clan_id: clanId
      });
    }
  } catch (error) {
    console.error(`Erreur chat clan ${clanId}:`, error.message);
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

    if (message.mentions.users.size > 0) {
      for (const [id, user] of message.mentions.users) {
        const member = message.guild ? await message.guild.members.fetch(id) : null;
        const displayName = member ? member.displayName : user.username;
        const mentionRegex = new RegExp(`<@!?${id}>`, 'g');
        content = content.replace(mentionRegex, `@${displayName}`);
      }
    }

    const displayNameAuthor = message.member?.displayName || message.author.username;
    await sendToWolvesville(displayNameAuthor, content, clanId, axios, headers);
  }
}

module.exports = {
  loadLastSeenDateFromDB,
  checkClanChat,
  sendToWolvesville,
  handleDiscordMessage
};