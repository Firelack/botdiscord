const deletedMessagesToday = new Set();

async function deleteOldMessages(channel, dateago) {
  console.log(`Suppression des anciens messages dans le salon ${channel.name} (${channel.id})`);

  try {
    const now = Date.now();

    let lastMessageId = null;
    let totalDeleted = 0;

    while (true) {
      // Fetch messages in batches of 100, starting from the last one retrieved
      const options = { limit: 100 };
      if (lastMessageId) options.before = lastMessageId;

      const messagesFetched = await channel.messages.fetch(options);
      if (messagesFetched.size === 0) break; // No more messages to fetch

      // Filter messages to delete
      const messagesToDelete = messagesFetched.filter(msg =>
        now - msg.createdTimestamp > dateago &&
        !deletedMessagesToday.has(msg.id)
      );

      if (messagesToDelete.size === 0) {
        // No messages to delete in this batch, we can stop
        break;
      }

      // Sequential deletion to avoid rate limit errors
      for (const msg of messagesToDelete.values()) {
        try {
          await msg.delete();
          deletedMessagesToday.add(msg.id);
          totalDeleted++;
          console.log(`→ Supprimé : ${msg.author.tag} (${msg.createdAt.toISOString()})`);
        } catch (err) {
          console.warn(`Échec suppression message ID ${msg.id} (auteur : ${msg.author.tag}) : ${err.message}`);
        }
      }

      // For pagination, take the ID of the last message in the current batch
      lastMessageId = messagesFetched.last().id;

      // If we fetched less than 100 messages, it's the end
      if (messagesFetched.size < 100) break;
    }

    console.log(`Total messages supprimés : ${totalDeleted}`);

  } catch (error) {
    console.error("Erreur suppression anciens messages :", error.message);
  }
}

function resetDailyDeletedMessages() {
  deletedMessagesToday.clear();
  console.log("🕛 Mémoire des suppressions réinitialisée pour la nouvelle journée.");
}

function scheduleMidnightTask(task) {
  const checkInterval = 60 * 1000; // Check every minute
  let alreadyRunToday = false;

  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      if (!alreadyRunToday) {
        console.log("🕛 Exécution de la tâche programmée de minuit.");
        task();
        alreadyRunToday = true;
      }
    } else {
      alreadyRunToday = false;
    }
  }, checkInterval);
}

module.exports = {
  deleteOldMessages,
  resetDailyDeletedMessages,
    scheduleMidnightTask
};
