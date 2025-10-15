require('dotenv').config();
const keepAlive = require('./keep_alive');
const axios = require('axios');

// Import all functions from API_function
// Delete sendMessage here to disable sendMessage feature
const { 
  activedesactiveParticipations, activeShopOffers, actualAvatar, actualquest, announcement, announcementChannel, avatarPlayer,
  battlepassChallenges, botInfo, changeFlair, clanMembers, commandList,
  deleteOldMessages, resetDailyDeletedMessages, easterEggs,
  getAdvancedRoles, getApiHat, getClanId, getClanInfo, idAvatar, infoRole,
  playerCards, playerProfil, playerStats, questAvailable, checkQuestStatus, roleRotations, 
  searchAvatarId, checkClanChat, handleDiscordMessage, scheduleDailyTask, mondayAnnouncementTask,
  // Delete sendMessage here to disable sendMessage feature
  sendMessage } = require('./index');

function start() {
  const { Client, GatewayIntentBits } = require("discord.js");

  const accessToken = process.env['APIKEY'];
  const botKey = process.env['BOT_KEY'];
  const clanId = process.env['CLAN_ID'];
  const chatChannelId = process.env['CHAT_CHANNEL_ID'];
  const leaderChannelId = process.env['LEADER_CHANNEL_ID'];
  const announcementChannelId = process.env['ANNOUNCEMENT_CHANNEL_ID'];

  // Delete these line to disable sendMessage
  const messageChannelId = process.env['MESSAGE_CHANNEL_ID'];
  const personMentionId = process.env['PERSON_MENTION_ID'];

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
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

    // Pre-fetch members for all guilds to improve mention resolution
    // This helps to ensure nicknames and usernames are available in the cache
    for (const [guildId, guild] of client.guilds.cache) {
      try {
        await guild.members.fetch();
        console.log(`👥 Cache des membres préchargé pour ${guild.name}`);
      } catch (err) {
        console.warn(`⚠️ Impossible de précharger les membres pour ${guild.name}:`, err.message);
      }
    }


    // Start checking for new clan chat messages
    setInterval(() => checkClanChat(client, clanId, chatChannelId, axios, headers), 20000);
    setInterval(() => checkQuestStatus(client, clanId, leaderChannelId, axios, headers), 600000); // Every 10 minutes

    // Start announcement channel feature (once per hour)
    setInterval(() => announcementChannel(client, announcementChannelId, clanId, axios, headers), 60 * 60 * 1000);

    const channel = await client.channels.fetch(chatChannelId);

    // Delete these lines to disable sendMessage
    const messageHour = 10; // 10h
    const messageMinute = 0; // 00 minutes
    sendMessage(client, messageChannelId, personMentionId, "Envoie ton temps d'écran maintenant !", messageHour, messageMinute);

    scheduleDailyTask(async () => {
      resetDailyDeletedMessages();
      await deleteOldMessages(channel, 2 * 24 * 60 * 60 * 1000); // Delete messages older than 2 days
    }, 0, 0); // 0h00

    // Schedule Monday announcement at 6:00 AM
    scheduleDailyTask(() => mondayAnnouncementTask(clanId, axios, headers), 6, 0);
  });

  client.login(`Bot ${botKey}`);

  client.on("messageCreate", async (message) => {
    await handleDiscordMessage(message, clanId, chatChannelId, axios, headers);

    if (message.channel.id !== chatChannelId) { // Ignore messages in the clan chat relay channel

      if (message.content === "!desactiver" && message.author.tag === "firelack") { // Desactivation command if Firelack asked
        console.log('Désactivation du bot.');
        client.user.setPresence({ status: 'invisible' });
        client.destroy();
      }

      if (message.author.id === client.user.id) return; // Ignore messages from the bot itself

      if (message.channel.id === leaderChannelId) {
      activedesactiveParticipations(message, clanId, leaderChannelId, axios, headers);
      changeFlair(message, clanId, leaderChannelId, axios, headers);
      return; // Stop processing other commands
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

      if (message.channel.id !== leaderChannelId) {
        easterEggs(message); 
      }
    }
  });
}

keepAlive();
start();