const generateBonusAnnouncement = require('./generateBonusAnnouncement.js');

/**
 * Command to generate a bonus/malus announcement
 * bonusannonce
 */
async function bonusAnnouncement(message, clanId) {
  if (!message.content.toLowerCase().startsWith("bonusannonce")) return;

  // Generate announcement text
  const announcementText = await generateBonusAnnouncement(clanId);

  // Send the announcement text back to Discord
  message.reply(announcementText);
}

module.exports = bonusAnnouncement;