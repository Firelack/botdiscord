/**
 * Schedule a daily task to run at a specific hour and minute in the 'Europe/Paris' timezone.
 * @param {Function} task - The task function to execute daily.
 * @param {number} targetHour - The hour (0-23) at which to run the task.
 * @param {number} targetMinute - The minute (0-59) at which to run the task.
 * @returns {void}
 */
function scheduleDailyTask(task, targetHour = 0, targetMinute = 0) {
  const checkInterval = 60 * 1000; // Check every minute
  let alreadyRunToday = false;

  setInterval(() => {
    const now = new Date();

    // To ensure we are checking the time in the 'Europe/Paris' timezone,
    const options = {
      timeZone: 'Europe/Paris',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false // Use 24-hour format
    };

    // Obtain the current time string in the specified timezone
    const timeString = now.toLocaleString('fr-FR', options);

    // Extract hour and minute from the formatted string
    const [hourStr, minuteStr] = timeString.split(':');
    let currentHour = parseInt(hourStr, 10);
    const currentMinute = parseInt(minuteStr, 10);

    // Handle the edge case where currentHour is 24
    if (currentHour === 24) {
      currentHour = 0;
    }

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

module.exports = scheduleDailyTask;