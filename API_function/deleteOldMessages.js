const deletedMessagesToday = new Set();

async function deleteOldMessages(channel, dateago) {
  console.log(`Suppression des anciens messages dans le salon ${channel.name} (${channel.id})`);

  try {
    const now = Date.now();

    let lastMessageId = null;
    let totalDeleted = 0;

    while (true) {
      // Récupération des messages par lots de 100, en partant du dernier récupéré
      const options = { limit: 100 };
      if (lastMessageId) options.before = lastMessageId;

      const messagesFetched = await channel.messages.fetch(options);
      if (messagesFetched.size === 0) break; // Plus aucun message à récupérer

      // Filtrage des messages à supprimer
      const messagesToDelete = messagesFetched.filter(msg =>
        now - msg.createdTimestamp > dateago &&
        !deletedMessagesToday.has(msg.id)
      );

      if (messagesToDelete.size === 0) {
        // Pas de message à supprimer dans ce lot, on peut arrêter
        break;
      }

      // Suppression séquentielle pour éviter les erreurs de rate limit
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

      // Pour la pagination, on prend l'id du dernier message du lot actuel
      lastMessageId = messagesFetched.last().id;

      // Si on a récupéré moins de 100 messages, c'est que c'est la fin
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
  const checkInterval = 60 * 1000; // Vérifie chaque minute
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
