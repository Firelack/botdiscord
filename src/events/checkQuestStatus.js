const supabase = require('../utils/superbaseClient');

/**
 * Ensure the quest status is checked for a specific clan,
 * and notify the Discord channel if the quest or tier has just finished.
 * Writes the current quest status back to the database.
 * @param {object} client - The Discord client instance.
 * @param {string} clanId - The ID of the clan to check.
 * @param {string} questChannelId - The ID of the Discord channel to send notifications to.
 * @param {object} axios - The axios instance for making HTTP requests.
 * @param {object} headers - The headers to include in the API requests.
 */
async function checkQuestStatus(client, clanId, questChannelId, axios, headers) {
  const channel = client.channels.cache.get(questChannelId);
  if (!channel) {
    console.error(`Le salon avec l'ID ${questChannelId} est introuvable.`);
    return;
  }

  // Read the last known quest status from the database
  let { data: flag, error: dbError } = await supabase
    .from('bot_state')
    .select('value')
    .eq('key', 'quest_active')
    .eq('clan_id', clanId)
    .single();

  if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = not found
    console.error(`Erreur DB (checkQuestStatus - read) pour clan ${clanId}:`, dbError);
    return;
  }

  const wasQuestActive = flag && flag.value === 'true';
  let isQuestActive = false; // By default, assume no active quest
  let questFinishedMessage = null;

  try {
    // Fetch the current quest status from the Wolvesville API
    const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/active`, { headers });
    const quest = response.data?.quest;
    const tierFinished = response.data?.tierFinished;
    
    isQuestActive = quest && !tierFinished; // True if there's an active quest and the tier is not finished

    if (tierFinished && wasQuestActive) {
      questFinishedMessage = "L'étape actuelle de la quête est terminée";
    }

  } catch (error) {
    // If 404, no active quest
    isQuestActive = false;
    if (wasQuestActive) {
      questFinishedMessage = "La quête actuelle est terminée !";
    }
  }

  // Notify if status changed from true to false
  if (wasQuestActive && !isQuestActive && questFinishedMessage) {
    channel.send(questFinishedMessage);
    console.log(`Notification envoyée (Clan ${clanId}): ${questFinishedMessage}`);
  }

  // Always update the database with the current status
  try {
    await supabase.from('bot_state').upsert({ 
      key: 'quest_active', 
      value: isQuestActive.toString(), // 'true' ou 'false'
      clan_id: clanId
    });
  } catch (dbWriteError) {
    console.error(`Erreur DB (checkQuestStatus - write) pour clan ${clanId}:`, dbWriteError);
  }
}

module.exports = checkQuestStatus;