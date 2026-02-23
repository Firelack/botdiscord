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
      
      // Update bot state in DB FIRST (Suppression before insertion to avoid duplicates)
      // We do this BEFORE processQuestLaunch so if the process crashes, we don't spam the message again.
      await supabase.from('bot_state').delete().eq('clan_id', clanId).eq('key', 'quest_active');
      await supabase.from('bot_state').delete().eq('clan_id', clanId).eq('key', 'current_quest_id');

      await supabase.from('bot_state').insert([
        { clan_id: clanId, key: 'quest_active', value: 'true' },
        { clan_id: clanId, key: 'current_quest_id', value: currentQuest.quest.id }
      ]);
      
      // Start logic for new quest (Wrapped in try/catch to prevent bot crash if it fails)
      try {
        await processQuestLaunch(clanId, currentQuest, axios, headers, client, questChannelId);
      } catch (error) {
        console.error("Erreur critique lors de processQuestLaunch :", error);
        channel.send("⚠️ Une nouvelle quête a été détectée, mais une erreur est survenue lors de la génération du rapport détaillé.");
      }
      
    } else if (!wasQuestActive) {
      // 2 : Same quest, but a NEW tier just started
      // We need to mark the quest as active again so we can track when this new tier finishes
      console.log(`[Déclencheur] Nouvelle étape de la quête en cours détectée.`);
      await supabase.from('bot_state').delete().eq('clan_id', clanId).eq('key', 'quest_active');
      await supabase.from('bot_state').insert([
        { clan_id: clanId, key: 'quest_active', value: 'true' }
      ]);
    }
    
  } else {
    // 3 : Quest finished
    if (wasQuestActive) {
      console.log(`[Déclencheur 1] Fin de quête détectée. Envoi de la notification.`);
      
      // Determine next ID value: if it's just a tier finish, keep the ID so we don't trigger "New Quest" on next tier.
      let nextIdValue = 'none';
      if (currentQuest && currentQuest.tierFinished) {
          nextIdValue = currentQuest.quest.id;
      }

      // Update bot state in DB FIRST (Suppression before insertion to avoid duplicates)
      await supabase.from('bot_state').delete().eq('clan_id', clanId).eq('key', 'quest_active');
      await supabase.from('bot_state').delete().eq('clan_id', clanId).eq('key', 'current_quest_id');

      await supabase.from('bot_state').insert([
        { clan_id: clanId, key: 'quest_active', value: 'false' },
        { clan_id: clanId, key: 'current_quest_id', value: nextIdValue } // Reset ID only if really finished
      ]);

      // Then send the notification message
      if (channel && questFinishedMessage) {
        try {
          await channel.send(questFinishedMessage);
        } catch (err) {
          console.error("Erreur lors de l'envoi du message de fin :", err);
        }
      }
    }
    // 4 : No quest active, no change (do nothing)
  }
}

module.exports = checkQuestStatus;