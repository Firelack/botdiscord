/**
 * Send a message to a specific channel and user, with reminders if no response is received.
 * @param {Client} client - Client Discord instance
 * @param {string} channelId - Channel ID where the message will be sent
 * @param {string} userId - User ID to mention in the message
 * @param {string} messageText - Message content to send
 */
async function sendMessage(client, channelId, userId, messageText) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error("Salon introuvable !");
      return;
    }

    // Send the initial message
    await channel.send(`<@${userId}> ${messageText}`);
    console.log(`✅ Premier message envoyé à <@${userId}> dans #${channel.name}`);

    let userReplied = false;
    let reminderInterval;

    const messageListener = (msg) => {
      if (msg.author.id === userId && msg.mentions.has(client.user.id)) {
        console.log(`✅ Réponse reçue de <@${userId}> : rappel arrêté`);
        userReplied = true;
        client.off("messageCreate", messageListener); // Stop listening for messages
        if (reminderInterval) clearInterval(reminderInterval); // Stop reminders
      }
    };

    client.on("messageCreate", messageListener);

    // Set up reminders every 30 minutes if no reply
    reminderInterval = setInterval(async () => {
      if (userReplied) {
        clearInterval(reminderInterval); // Stop reminders
        client.off("messageCreate", messageListener); // Stop listening for messages
        return;
      }
      await channel.send(`<@${userId}> ⏰ Petit rappel : ${messageText}`);
      console.log(`🔄 Rappel envoyé à <@${userId}>`);
    }, 30 * 60 * 1000); // 30 minutes

  } catch (err) {
    console.error("❌ Erreur lors de l'envoi du message programmé :", err.message);
  }
}

module.exports = { sendMessage };