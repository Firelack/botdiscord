const executeQuestAnnouncement = require('./executeQuestAnnouncement.js');
const supabase = require('../utils/superbaseClient.js');

/**
 * Send a quest announcement on Mondays if enabled in the bot configuration.
 * @param {string} clanId - The ID of the clan.
 * @param {object} axios - The axios instance for making HTTP requests.
 * @param {object} headers - The headers for the HTTP requests.
 * @returns {Promise<void>}
 */
async function mondayQuestAnnouncementTask(clanId, axios, headers) {
  const now = new Date();
  // Verification of the current day in French locale
  const day = now.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long' });

  if (day.toLowerCase() !== 'lundi') {
     return; // It's not Monday, exit the function
  }

  // If automatic announcements are disabled, exit the function
  let { data: config } = await supabase
    .from('bot_state')
    .select('value')
    .eq('clan_id', clanId)
    .eq('key', 'enable_monday_announcement')
    .single();

  if (!config || config.value !== 'true') {
    console.log("Annonce de quête du Lundi désactivée, on saute.");
    return;
  }

  // Default launch time for the quest announcement
  const defaultLaunchTime = "Mardi 20h00";
  
  // Execute the quest announcement
  await executeQuestAnnouncement(clanId, axios, headers, defaultLaunchTime, null);
}

module.exports = mondayQuestAnnouncementTask;