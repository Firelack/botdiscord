require('dotenv').config();
const keepAlive = require('./keep_alive');
const axios = require('axios');

// Import des fonctions pour les commandes
const { avatarPlayer, actualAvatar, questAvailable, announcement, clanMembers, getClanId, getClanInfo,
  playerStats, playerCards, playerProfil, infoRole, getAdvancedRoles, activeShopOffers, battlepassChallenges,
  roleRotations, idAvatar, searchAvatarId, getApiHat, botInfo, commandList, easterEggs, checkClanChat,
  handleDiscordMessage, scheduleMidnightTask, deleteOldMessages, resetDailyDeletedMessages, actualquest,
  checkQuestStatus, activedesactiveParticipations, changeFlair, sendMessage } = require('./API_function');

function start() {
  const { Client, GatewayIntentBits } = require("discord.js");

  const accessToken = process.env['APIKEY'];
  const botKey = process.env['BOT_KEY'];
  const clanId = process.env['CLAN_ID'];
  const chatChannelId = process.env['CHAT_CHANNEL_ID'];
  const questChannelId = process.env['QUEST_CHANNEL_ID'];
  const participationChannelId = process.env['PARTICIPATION_CHANNEL_ID'];
  const messageChannelId = process.env['MESSAGE_CHANNEL_ID'];
  const personMentionId = process.env['PERSON_MENTION_ID'];

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

  client.on("ready", async () => {
    console.log("Bot opérationnel");

    // Lancement de la boucle de check toutes les 5 secondes
    setInterval(() => checkClanChat(client, clanId, chatChannelId, axios, headers), 20000);
    setInterval(() => checkQuestStatus(client, clanId, questChannelId, axios, headers), 600000); // Toutes les 10 minutes


    // Récupération du salon Discord de façon asynchrone
    const channel = await client.channels.fetch(chatChannelId);

    const messageHour = 10; // 10h
    const messageMinute = 0; // 00 minutes

    sendMessage(client, messageChannelId, personMentionId, "Envoie ton temps d'écran maintenant !", messageHour, messageMinute);

    // Planification de la tâche de suppression à minuit
    scheduleMidnightTask(async () => {
      resetDailyDeletedMessages();
      await deleteOldMessages(channel, 2 * 24 * 60 * 60 * 1000); // Supprimer les messages de plus de 2 jours
    });
  });

  client.login(`Bot ${botKey}`);

  client.on("messageCreate", async (message) => {
    await handleDiscordMessage(message, clanId, chatChannelId, axios, headers);

    if (message.channel.id !== chatChannelId) { // Ignore les message du salon lié au clan

      if (message.content === "!desactiver" && message.author.tag === "firelack") { // Désactivation du bot si Firelack le demande
        console.log('Désactivation du bot.');
        client.user.setPresence({ status: 'invisible' });
        client.destroy();
      }

      if (message.author.id === client.user.id) return; // Ignore les messages du bot lui-même

      if (message.channel.id === participationChannelId) {
      activedesactiveParticipations(message, clanId, participationChannelId, axios, headers);
      changeFlair(message, clanId, participationChannelId, axios, headers);
      return; // Sort de la fonction pour ne pas traiter les autres commandes
    }

      commandList(message);
      botInfo(message);
      actualquest(message, clanId, axios, headers);
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

      if (message.channel.id !== participationChannelId) {
        easterEggs(message); 
      }
    }
  });
}

keepAlive();
start();