const supabase = require('../utils/superbaseClient');
const SCREEN_TIME_KEY = 'screentime_replied';

/**
 * Define state to "not replied" and send the initial message.
 * @param {object} client - The Discord client instance.
 * @param {string} clanId - The ID of the clan.
 * @param {string} channelId - The ID of the Discord channel to send the message to.
 * @param {string} userId - The ID of the user to mention.
 * @param {string} messageText - The message text to send.
 * @returns {Promise<void>}
 */
async function triggerDailyScreenTime(client, clanId, channelId, userId, messageText) {
  console.log(`🕒 Déclenchement de la tâche "Temps d'écran" pour ${userId}`);
  try {
    // Define state to "not replied" (reset for the day)
    await supabase.from('bot_state').upsert({
      clan_id: clanId,
      key: SCREEN_TIME_KEY,
      value: 'false'
    });

    // Send the initial message
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      await channel.send(`<@${userId}> ${messageText}`);
      console.log(`✅ Premier message "Temps d'écran" envoyé à <@${userId}>`);
    }
  } catch (err) {
    console.error("❌ Erreur lors du déclenchement de la tâche 'Temps d'écran':", err.message);
  }
}

/**
 * Setup a listener to capture the user's response.
 * @param {object} client - The Discord client instance.
 * @param {string} clanId - The ID of the clan.
 * @param {string} userId - The ID of the user to listen for.
 * @returns {void}
 */
function setupScreenTimeListener(client, clanId, userId) {
  console.log(`🎧 Mise en place du listener 'Temps d'écran' pour ${userId}`);
  
  client.on("messageCreate", async (msg) => {
    // Ignore messages not from the target user or not mentioning the bot
    if (msg.author.id !== userId || !msg.mentions.has(client.user.id)) {
      return;
    }

    try {
      // Verify if the user has already responded
      const { data } = await supabase
        .from('bot_state')
        .select('value')
        .eq('clan_id', clanId)
        .eq('key', SCREEN_TIME_KEY)
        .single();

      if (data && data.value === 'false') {
        // Update state to "replied"
        console.log(`✅ Réponse "Temps d'écran" reçue de <@${userId}>. Arrêt des rappels.`);
        await supabase.from('bot_state').upsert({
          clan_id: clanId,
          key: SCREEN_TIME_KEY,
          value: 'true'
        });
      }
    } catch (err) {
       console.error("❌ Erreur dans le listener 'Temps d'écran':", err.message);
    }
  });
}

/**
 * Check if a reminder should be sent.
 * @param {object} client - The Discord client instance.
 * @param {string} clanId - The ID of the clan.
 * @param {string} channelId - The ID of the Discord channel to send the reminder to.
 * @param {string} userId - The ID of the user to mention.
 * @param {string} messageText - The reminder message text to send.
 * @returns {Promise<void>}
 */
async function checkScreenTimeReminder(client, clanId, channelId, userId, messageText) {
  const now = new Date();
  const options = { timeZone: 'Europe/Paris', hour: 'numeric', hour12: false };
  const hourStr = now.toLocaleString('fr-FR', options);
  const currentHour = parseInt(hourStr === '24' ? '0' : hourStr, 10);
  
  // Skip reminders before 10 AM
  if (currentHour < 10) {
    return; 
  }

  try {
    const { data } = await supabase
      .from('bot_state')
      .select('value')
      .eq('clan_id', clanId)
      .eq('key', SCREEN_TIME_KEY)
      .single();

    // If not replied, send a reminder
    if (data && data.value === 'false') {
      const channel = await client.channels.fetch(channelId);
      if (channel) {
        await channel.send(`<@${userId}> ⏰ Petit rappel : ${messageText}`);
        console.log(`🔄 Rappel "Temps d'écran" envoyé à <@${userId}>`);
      }
    }
  } catch (err) {
     if (err.code !== 'PGRST116') { // Ignore "no rows found" error
        console.error("❌ Erreur lors de l'envoi du rappel 'Temps d'écran':", err.message);
     }
  }
}

module.exports = {
  triggerDailyScreenTime,
  setupScreenTimeListener,
  checkScreenTimeReminder
};