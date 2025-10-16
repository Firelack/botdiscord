// mondayAnnouncementTask.js
const postAnnouncement = require('./postAnnouncement.js');

function mondayAnnouncementTask(clanId, axios, headers) {
  const now = new Date();
  if (now.getDay() === 1) {
    const message = "Bonjouuur,\n\nPensez à votez pour les quêtes de cette semaine\n(Seulement si vous comptez participer)\n\nBonne semaine à tous ! 😊";
    postAnnouncement(axios, headers, clanId, message);
    console.log("📢 Annonce du lundi envoyée.");
  } else {
    console.log("⏭️ Ce n'est pas lundi, aucune annonce envoyée.");
  }
}

module.exports = mondayAnnouncementTask;
