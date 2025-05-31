require('dotenv').config();
const keepAlive = require('./keep_alive');
const axios = require('axios');

// Import des fonctions pour les commandes
const { avatarPlayer, actualAvatar, questAvailable, announcement, clanMembers, getClanId, getClanInfo,
  playerStats, playerCards, playerProfil, infoRole, getAdvancedRoles, activeShopOffers, battlepassChallenges,
  roleRotations, idAvatar, searchAvatarId, getApiHat, botInfo, commandList, easterEggs, checkClanChat, sendToWolvesville } = require('./API_function');

function start() {
  const { Client, GatewayIntentBits } = require("discord.js");

  const accessToken = process.env['APIKEY'];
  const botKey = process.env['BOT_KEY'];
  const clanId = process.env['CLAN_ID'];
  const salonId = process.env['SALON_ID'];

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]
  });

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bot ${accessToken}`
  };

  client.on("ready", () => {
    console.log("Bot opérationnel");

    // Appel direct avec tous les paramètres
    setInterval(() => checkClanChat(client, clanId, salonId, axios, headers), 5000);
  });

  client.login(`Bot ${botKey}`);

  client.on("messageCreate", async (message) => {
    const discordEmojiRegex = /<a?:\w+:\d+>/g;

    const canSendToWolvesville =
      !message.author.bot &&
      !discordEmojiRegex.test(message.content) &&
      message.channel.id === salonId &&
      message.attachments.size === 0 &&
      message.stickers.size === 0 &&
      message.embeds.length === 0;

    if (canSendToWolvesville) {
      const displayName = message.member?.displayName || message.author.username;
      await sendToWolvesville(displayName, message.content, clanId, axios, headers);
    }

    if (message.channel.id !== salonId) { // Ignore les message du salon lié au clan

      if (message.content === "!desactiver" && message.author.tag === "firelack") { // Désactivation du bot si Firelack le demande
        console.log('Désactivation du bot.');
        client.user.setPresence({ status: 'invisible' });
        client.destroy();
      }

      if (message.author.id === client.user.id) return; // Ignore les messages du bot lui-même

      easterEggs(message);
      commandList(message);
      botInfo(message);
      getApiHat(message, axios, headers);
      searchAvatarId(message, axios, headers);
      idAvatar(message, axios, headers);
      roleRotations(message, axios, headers);
      battlepassChallenges(message, axios, headers);
      activeShopOffers(message, axios, headers);
      getAdvancedRoles(message, axios, headers);
      infoRole(message, axios, headers);
      playerProfil(message, axios, headers);
      playerCards(message, axios, headers);
      playerStats(message, axios, headers);
      getClanInfo(message, axios, headers);
      getClanId(message, axios, headers);
      clanMembers(message, axios, headers);
      announcement(message, clanId, axios, headers);
      questAvailable(message, clanId, axios, headers);
      actualAvatar(message, axios, headers);
      avatarPlayer(message, axios, headers);
    }
  });
}

keepAlive();
start();
