// mondayAnnouncementTask.js
const postAnnouncement = require('./postAnnouncement.js');

/**
 * Send a Monday announcement to remind clan members to vote for quests.
 * @param {string} clanId - The ID of the clan to send the announcement to.
 * @param {object} axios - The axios instance for making HTTP requests.
 * @param {object} headers - The headers to include in the request.
 * @returns {Promise<void>}
 */
function mondayAnnouncementTask(clanId, axios, headers) {
  const now = new Date();
  if (now.getDay() === 1) {
    const message = "Bonjouuur,\n\nPensez à votez pour les quêtes de cette semaine\n(Seulement si vous comptez participer sinon vous aurez un malus)\n\nBonne semaine à tous ! 😊";
    postAnnouncement(axios, headers, clanId, message);
    console.log("📢 Annonce du lundi envoyée.");
  } else {
    console.log("⏭️ Ce n'est pas lundi, aucune annonce envoyée.");
  }
}

module.exports = mondayAnnouncementTask;
