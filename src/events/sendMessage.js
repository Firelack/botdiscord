/**
 * Schedule a message to be sent in a Discord channel with reminders, every day at the same time.
 * @param {Client} client - Bot Discord instance
 * @param {string} channelId - ID of the channel to send the message in
 * @param {string} userId - ID of the user to mention
 * @param {string} messageText - Personalised message to send
 * @param {number} hour - Hour of the day to send the message (0-23)
 * @param {number} minute - Minute of the hour to send the message (0-59)
 */
function sendMessage(client, channelId, userId, messageText, hour, minute) {

  async function scheduleNextMessage() {
    try {
      const now = new Date();
      now.setHours(now.getHours() + 2)
      let sendTime = new Date();
      sendTime.setHours(hour, minute, 0, 0);

      // If date already passed, schedule for the next day
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

          // Send the initial message
          await channel.send(`<@${userId}> ${messageText}`);
          console.log(`✅ Premier message envoyé à <@${userId}> dans #${channel.name}`);

          // Flag to know if the person replied
          let userReplied = false;

          const messageListener = (msg) => {
            if (msg.author.id === userId && msg.mentions.has(client.user.id)) {
              console.log(`✅ Réponse reçue de <@${userId}> : rappel arrêté`);
              userReplied = true;
              client.off("messageCreate", messageListener);
            }
          };

          client.on("messageCreate", messageListener);

          // Set up reminders every 30 minutes until user replies
          const reminderInterval = setInterval(async () => {
            if (userReplied) {
              clearInterval(reminderInterval);
              return;
            }
            await channel.send(`<@${userId}> ⏰ Petit rappel : ${messageText}`);
            console.log(`🔄 Rappel envoyé à <@${userId}>`);
          }, 30 * 60 * 1000);

          // Automatically add reminder for the next day
          scheduleNextMessage();

        } catch (err) {
          console.error("❌ Erreur lors de l'envoi du message :", err.message);
        }
      }, delay);

    } catch (err) {
      console.error("❌ Erreur dans sendMessageDaily :", err.message);
    }
  }

  // Start the scheduling process
  scheduleNextMessage();
}

module.exports = { sendMessage };
