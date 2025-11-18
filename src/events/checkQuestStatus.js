const supabase = require('../utils/superbaseClient');
// Import trigger 1
const processQuestLaunch = require('../tasks/processQuestLaunch.js'); 

/**
 * If new quest, trigger processQuestLaunch.
 * If quest finished, send notification.
 * @param {object} client - Discord client instance.
 * @param {string} clanId - Clan ID.
 * @param {string} questChannelId - Discord channel ID for quest notifications.
 * @param {object} axios - Axios instance for HTTP requests.
 * @param {object} headers - Headers for the API requests.
 * @return {Promise<void>}
 */
async function checkQuestStatus(client, clanId, questChannelId, axios, headers) {
  const channel = client.channels.cache.get(questChannelId);
  if (!channel) {
    console.error(`Le salon avec l'ID ${questChannelId} est introuvable.`);
    return;
  }

  // Read current bot state from DB
  let { data: botState, error: dbError } = await supabase
    .from('bot_state')
    .select('key, value')
    .eq('clan_id', clanId)
    .in('key', ['quest_active', 'current_quest_id']);

  if (dbError) {
    console.error(`Erreur DB (checkQuestStatus - read) pour clan ${clanId}:`, dbError);
    return;
  }

  const wasQuestActive = botState.find(s => s.key === 'quest_active')?.value === 'true';
  const lastKnownQuestId = botState.find(s => s.key === 'current_quest_id')?.value;

  let currentQuest = null;
  let isQuestCurrentlyActive = false;
  let questFinishedMessage = null;

  try {
    // Fetch current active quest from API
    const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/active`, { headers });
    currentQuest = response.data;
    
    // Active quest exists and is not finished
    isQuestCurrentlyActive = currentQuest && !currentQuest.tierFinished;

    if (currentQuest && currentQuest.tierFinished && wasQuestActive) {
      questFinishedMessage = "L'étape actuelle de la quête est terminée";
    }

  } catch (error) {
    // Error 404 = no active quest
    isQuestCurrentlyActive = false;
    if (wasQuestActive) {
      questFinishedMessage = "La quête actuelle est terminée !";
    }
  }

  // Logic branching based on quest status

  if (isQuestCurrentlyActive) {
    // 1 : New quest detected
    if (currentQuest.quest.id !== lastKnownQuestId) {
      console.log(`[Déclencheur 1] Nouvelle quête détectée : ${currentQuest.quest.id}. Lancement du traitement des votes/dons.`);
      
      // Start logic for new quest
      await processQuestLaunch(clanId, currentQuest, axios, headers, client, questChannelId);
      
      // Update bot state in DB
      await supabase.from('bot_state').upsert([
        { clan_id: clanId, key: 'quest_active', value: 'true' },
        { clan_id: clanId, key: 'current_quest_id', value: currentQuest.quest.id }
      ]);
    }
    // 2 : Ongoing quest, no change (do nothing)
    
  } else {
    // 3 : Quest finished
    if (wasQuestActive) {
      console.log(`[Déclencheur 1] Fin de quête détectée. Envoi de la notification.`);
      if (channel && questFinishedMessage) {
        channel.send(questFinishedMessage);
      }
      
      // Update bot state in DB
      await supabase.from('bot_state').upsert([
        { clan_id: clanId, key: 'quest_active', value: 'false' },
        { clan_id: clanId, key: 'current_quest_id', value: 'none' } // Reset ID
      ]);
    }
    // 4 : No quest active, no change (do nothing)
  }
}

module.exports = checkQuestStatus;