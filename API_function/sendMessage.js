/**
 * Programme l'envoi d'un message dans un salon Discord avec rappels, tous les jours à la même heure.
 * @param {Client} client - L'instance du bot Discord
 * @param {string} channelId - L'ID du salon où envoyer le message
 * @param {string} userId - L'ID de la personne à mentionner
 * @param {string} messageText - Le message personnalisé
 * @param {number} hour - Heure du jour pour envoyer le message (0-23)
 * @param {number} minute - Minute de l'heure (0-59)
 */
function sendMessage(client, channelId, userId, messageText, hour, minute) {

  async function scheduleNextMessage() {
    try {
      const now = new Date();
      let sendTime = new Date();
      sendTime.setHours(hour, minute, 0, 0);

      // Si l'heure est déjà passée, on programme pour demain
      if (sendTime <= now) {
        sendTime.setDate(sendTime.getDate() + 1);
      }

      const delay = sendTime.getTime() - now.getTime();
      console.log(`📅 Message programmé pour ${sendTime.toLocaleString()}`);

      setTimeout(async () => {
        try {
          const channel = await client.channels.fetch(channelId);
          if (!channel) {
            console.error("Salon introuvable !");
            return;
          }

          // Premier envoi
          await channel.send(`<@${userId}> ${messageText}`);
          console.log(`✅ Premier message envoyé à <@${userId}> dans #${channel.name}`);

          // Flag pour savoir si la personne a répondu
          let userReplied = false;

          const messageListener = (msg) => {
            if (msg.author.id === userId && msg.mentions.has(client.user.id)) {
              console.log(`✅ Réponse reçue de <@${userId}> : rappel arrêté`);
              userReplied = true;
              client.off("messageCreate", messageListener);
            }
          };

          client.on("messageCreate", messageListener);

          // Rappels toutes les 30 min tant que pas de réponse
          const reminderInterval = setInterval(async () => {
            if (userReplied) {
              clearInterval(reminderInterval);
              return;
            }
            await channel.send(`<@${userId}> ⏰ Petit rappel : ${messageText}`);
            console.log(`🔄 Rappel envoyé à <@${userId}>`);
          }, 30 * 60 * 1000);

          // Reprogrammer automatiquement pour le lendemain
          scheduleNextMessage();

        } catch (err) {
          console.error("❌ Erreur lors de l'envoi du message :", err.message);
        }
      }, delay);

    } catch (err) {
      console.error("❌ Erreur dans sendMessageDaily :", err.message);
    }
  }

  // Lancer la première planification
  scheduleNextMessage();
}

module.exports = { sendMessage };
