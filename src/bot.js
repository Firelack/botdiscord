require('dotenv').config();
const keepAlive = require('./utils/keepAlive');
const axios = require('axios');

// Import all functions
const { 
  changeParticipations, activeShopOffers, actualAvatar, actualQuest, announcement, 
  announcementChannel, loadAnnouncementsFromDB, avatarPlayer,
  battlepassChallenges, botInfo, changeFlair, clanMembers, commandList,
  deleteOldMessages, easterEggs,
  getAdvancedRoles, getApiHat, getClanId, getClanInfo, idAvatar, infoRole, leadersCommandsInfo,
  playerCards, playerProfil, playerStats, questAvailable, checkQuestStatus, roleRotations, 
  searchAvatarId, loadLastSeenDateFromDB,
  checkClanChat, handleDiscordMessage, scheduleDailyTask, 
  mondayAnnouncementTask, sendQuestAnnouncement, mondayQuestAnnouncementTask,
  toggleMondayQuest, toggleGemQuests,
  sendMessage, triggerDailyScreenTime, setupScreenTimeListener, checkScreenTimeReminder
} = require('./utils/index');

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

  client.on("clientReady", async () => {
    console.log("Bot opérationnel");
    
    if (!clanId) {
      console.error("ERREUR CRITIQUE : CLAN_ID n'est pas défini dans .env !");
      return;
    }
    console.log(`Connecté pour le clan : ${clanId}`);

    // Load announcements and last seen chat timestamp from DB at startup
    try {
      await loadAnnouncementsFromDB();
    } catch (err) {
      console.error("❌ Erreur critique lors du chargement initial des annonces :", err);
    }
    try {
      await loadLastSeenDateFromDB(clanId); 
    } catch (err) {
      console.error("❌ Erreur critique lors du chargement du timestamp chat :", err);
    }

    // Pre-fetch members
    for (const [guildId, guild] of client.guilds.cache) {
      try {
        await guild.members.fetch();
        console.log(`👥 Cache des membres préchargé pour ${guild.name}`);
      } catch (err) {
        console.warn(`⚠️ Impossible de précharger les membres pour ${guild.name}:`, err.message);
      }
    }

    // Delete these lines to disable sendMessage
    // Setup screen time listener and reminders
    if (personMentionId) {
      setupScreenTimeListener(client, clanId, personMentionId);
    }
    const reminderText = "Envoie ton temps d'écran maintenant !";
    setInterval(() => {
      checkScreenTimeReminder(client, clanId, messageChannelId, personMentionId, reminderText);
    }, 30 * 60 * 1000); // 30 minutes

    // Delete these lines to disable sendMessage
    scheduleDailyTask(() => {
      triggerDailyScreenTime(client, clanId, messageChannelId, personMentionId, reminderText);
    }, 10, 0); // 10h00

    // Start checking for new clan chat messages
    setInterval(() => checkClanChat(client, clanId, chatChannelId, axios, headers), 20 * 1000); // 20 sec

    // Check quest status every 10 minutes
    setInterval(() => checkQuestStatus(client, clanId, leaderChannelId, axios, headers), 10 * 60 * 1000); // 10 min

    // Announcement channel updates every hour
    setInterval(() => announcementChannel(client, announcementChannelId, clanId, axios, headers), 60 * 60 * 1000); // 1h

    const channel = await client.channels.fetch(chatChannelId);

    // Schedule old messages deletion
    scheduleDailyTask(async () => {
      await deleteOldMessages(channel, 2 * 24 * 60 * 60 * 1000);
    }, 0, 0); // 0h00

    // Schedule Monday Votes announcement
    scheduleDailyTask(() => mondayAnnouncementTask(clanId, axios, headers), 6, 0);

    // Schedule Monday Quest Announcement
    scheduleDailyTask(() => {
      mondayQuestAnnouncementTask(clanId, axios, headers); 
    }, 20, 0); // 20h00

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
        leadersCommandsInfo(message);
        await changeParticipations(message, clanId, leaderChannelId, axios, headers);
        await changeFlair(message, clanId, leaderChannelId, axios, headers);
        await toggleMondayQuest(message, clanId);
        await toggleGemQuests(message, clanId);
        await sendQuestAnnouncement(message, clanId, axios, headers);
        return; // Stop processing other commands
      }

      // Member commands
      commandList(message);
      botInfo(message);
      actualQuest(message, clanId, axios, headers);
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