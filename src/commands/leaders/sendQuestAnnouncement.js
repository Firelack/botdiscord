const executeQuestAnnouncement = require('../../tasks/executeQuestAnnouncement.js');

/** 
 * Helper function to get tomorrow's day name in French with default time 20:00
 * @return {string} Formatted string like "Mardi 20h00"
*/
function getTomorrowDefaultTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Use toLocaleString to get the day name in French
  const dayName = tomorrow.toLocaleString('fr-FR', { 
    weekday: 'long', 
    timeZone: 'Europe/Paris' 
  });
  
  // Format the day name to capitalize the first letter
  const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  
  return `${capitalizedDayName} 20h00`;
}

/**
 * Command to send a quest announcement.
 * Usage: announcequest [launchTime]:[questNumber]
 * - launchTime: Optional string indicating when the quest will launch (default: "Mardi 20h00")
 * - questNumber: Optional 1-based index of the quest to announce
 * @param {object} message - The Discord message object.
 * @param {string} clanId - The ID of the clan.
 * @param {object} axios - Instance Axios.
 * @param {object} headers - Headers API.
 * @return {void}
 */
async function sendQuestAnnouncement(message, clanId, axios, headers) {
  if (!message.content.toLowerCase().startsWith("announcequest")) return;

  // Extract arguments
  const rawArgs = message.content.substring(13).trim();
  
  let launchTimeArg = rawArgs;
  let questNumberArg = null;

  // If there is a quest number specified
  if (rawArgs.includes(':')) {
    const parts = rawArgs.split(':');
    launchTimeArg = parts[0].trim();
    questNumberArg = parts[1].trim();
  }

  // Get et default launch time for tomorrow at 20:00
  const defaultLaunchTime = getTomorrowDefaultTime();
  // Use provided launch time or default (tomorrow 20:00)
  const launchTime = launchTimeArg || defaultLaunchTime;

  let questNumber = null;

  // Parse quest number if provided
  if (questNumberArg) {
    questNumber = parseInt(questNumberArg, 10);
    if (isNaN(questNumber) || questNumber <= 0) {
      await message.reply("❌ Numéro de quête invalide. Le format est `!announcequest [heure]:[numéro]`.");
      return;
    }
  }

  // Call the main execution function with the quest number (can be null)
  await executeQuestAnnouncement(clanId, axios, headers, launchTime, message, questNumber);
}

module.exports = sendQuestAnnouncement;