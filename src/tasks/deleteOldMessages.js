const deletedMessagesToday = new Set();
const MESSAGE_TO_KEEP = process.env['MESSAGE_TO_KEEP_ID'] || null;

async function deleteOldMessages(channel, dateago) {
  console.log(`Suppression des anciens messages dans le salon ${channel.name} (${channel.id})`);

  try {
    const now = Date.now();
    const MAX_DELETE_AGE = 14 * 24 * 60 * 60 * 1000; // 14 days maximum Discord allows

    let lastMessageId = null;
    let totalDeleted = 0;
    let totalChecked = 0;

    while (true) {
      const options = { limit: 100 };
      if (lastMessageId) options.before = lastMessageId;

      const messagesFetched = await channel.messages.fetch(options);
      if (messagesFetched.size === 0) break; // No more messages to process

      for (const msg of messagesFetched.values()) {
        totalChecked++;

        // Conditions d'exclusion
        if (msg.id === MESSAGE_TO_KEEP) continue; // :lock: on garde ce message
        if (deletedMessagesToday.has(msg.id)) continue;
        const age = now - msg.createdTimestamp;
        if (age < dateago) continue; // message trop récent
        if (age > MAX_DELETE_AGE) continue; // message trop vieux pour suppression

        // Tentative de suppression
        try {
          await msg.delete();
          deletedMessagesToday.add(msg.id);
          totalDeleted++;
          console.log(`→ Supprimé : ${msg.author.tag} (${msg.createdAt.toISOString()})`);
        } catch (err) {
          console.warn(`⚠️ Échec suppression message ${msg.id} (${msg.author.tag}) : ${err.message}`);
        }
      }

      // For pagination, take the ID of the last message in the current batch
      lastMessageId = messagesFetched.last().id;

      // If we fetched less than 100 messages, it's the end
      if (messagesFetched.size < 100) break;
    }

    console.log(`✔️ Vérifiés : ${totalChecked} | Supprimés : ${totalDeleted}`);

  } catch (error) {
    console.error("Erreur suppression anciens messages :", error.message);
  }
}
function resetDailyDeletedMessages() {
  deletedMessagesToday.clear();
  console.log("🕛 Mémoire des suppressions réinitialisée pour la nouvelle journée.");
}

module.exports = {
  deleteOldMessages,
  resetDailyDeletedMessages,
};