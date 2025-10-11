function scheduleDailyTask(task, targetHour = 0, targetMinute = 0) {
  const checkInterval = 60 * 1000; // Verify every minute
  let alreadyRunToday = false;

  setInterval(() => {
    const now = new Date();

    if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
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

module.exports = scheduleDailyTask;