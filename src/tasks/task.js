import postAnnouncement from './postAnnouncement.js';

function scheduleDailyTask(task, targetHour = 0, targetMinute = 0) {
  const checkInterval = 60 * 1000; // Check every minute
  let alreadyRunToday = false;

  setInterval(() => {
    const now = new Date();
    const currentHour = (now.getUTCHours() + 2) % 24; // Adjust for UTC+2

    if (currentHour === targetHour && now.getMinutes() === targetMinute) {
      if (!alreadyRunToday) {
        console.log(`🕒 Exécution de la tâche planifiée à ${targetHour}h${targetMinute.toString().padStart(2, '0')}.`);
        task();
        alreadyRunToday = true;
      }
    } else {
      alreadyRunToday = false;
    }
  }, checkInterval);
}

function mondayAnnouncementTask(clanId, axios, headers) {
  const now = new Date();
  if (now.getDay() === 1) { // Monday = 1
    const message = "Bonjouuur,\n\nPensez à votez pour les quêtes de cette semaine\n(Seulement si vous comptez participer)\n\nBonne semaine à tous ! 😊";
    postAnnouncement(axios, headers, clanId, message);
    console.log("📢 Annonce du lundi envoyée.");
    } else {
    console.log("⏭️ Ce n'est pas lundi, aucune annonce envoyée.");
  }
}

export { scheduleDailyTask, mondayAnnouncementTask };
