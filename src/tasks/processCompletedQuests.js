const supabase = require('../utils/superbaseClient');
const generateBonusAnnouncement = require('../commands/leaders/generateBonusAnnouncement.js');

const XP_MALUS_THRESHOLD_PER_DAY = 300; // 300 XP per day of quest duration
const XP_BONUS_THRESHOLD = 10000; // 1 bonus for every 10,000 XP earned

/**
 * Trigger 2: Process completed quests.
 * Apply XP-based bonuses/maluses.
 * @param {string} clanId - The ID of the clan.
 * @param {object} axios - The axios instance for making HTTP requests.
 * @param {object} headers - The headers to include in the request.
 * @param {object} client - The Discord client instance.
 * @param {string} leaderChannelId - The ID of the Discord channel for leader reports.
 * @returns {Promise<void>}
 */
async function processCompletedQuests(clanId, axios, headers, client, leaderChannelId) {
  console.log(`[Quests Fin] Vérification des quêtes terminées pour ${clanId}...`);
  const channel = client.channels.cache.get(leaderChannelId);
  if (!channel) return;

  try {
    // Obtain last processed quest time
    let { data: lastQuestState } = await supabase
      .from('bot_state')
      .select('value')
      .eq('clan_id', clanId)
      .eq('key', 'last_processed_quest_time')
      .single();

    const lastProcessedTime = lastQuestState ? new Date(lastQuestState.value) : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Fetch quest history, clan members, ledger and clan info in parallel
    const [historyRes, membersRes, ledgerRes, clanInfoRes] = await Promise.all([
      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/history`, { headers }),
      axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers }),
      axios.get(`https://api.wolvesville.com/clans/${clanId}/ledger`, { headers }),
      axios.get(`https://api.wolvesville.com/clans/${clanId}/info`, { headers }) 
    ]);

    const questHistory = historyRes.data;
    const ledger = ledgerRes.data;
    const leaderId = clanInfoRes.data.leaderId;
    const clanMembers = new Map(membersRes.data.map(m => [m.playerId, m]));

    // Fetch players from DB
    let { data: dbPlayers } = await supabase
      .from('players')
      .select('player_id, username, quest_modifier')
      .eq('clan_id', clanId)
      .eq('in_clan', true);
    
    if (!dbPlayers) dbPlayers = [];
    const dbPlayerMap = new Map(dbPlayers.map(p => [p.player_id, p]));
    const updates = new Map(dbPlayers.map(p => [p.player_id, { change: 0, reports: [] }]));

    // Find new quests to Process
    const newQuests = questHistory
      .filter(q => new Date(q.tierEndTime) > lastProcessedTime)
      .sort((a, b) => new Date(a.tierEndTime) - new Date(b.tierEndTime));

    if (newQuests.length === 0) {
      return;
    }

    console.log(`[Quests Fin] ${newQuests.length} nouvelle(s) quête(s) terminée(s) à traiter.`);
    let lastQuestTime = lastProcessedTime;
    let finalReport = [];

    // Process each new quest
    for (const quest of newQuests) {
      const questId = quest.quest.id;
      const questEndTime = new Date(Date.now() - 30 * 60 * 1000); 
      
      const launchEntry = ledger.find(e => e.type === 'CLAN_QUEST' && e.clanQuestId === questId); // Find launch entry
      const questStartTime = launchEntry ? new Date(launchEntry.creationTime) : new Date(quest.tierStartTime);
      
      // Calculate quest duration in days
      const durationMs = questEndTime.getTime() - questStartTime.getTime();
      let durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      if (durationDays < 1) durationDays = 1; // Minimum 1 day
      
      const xpMalusThreshold = XP_MALUS_THRESHOLD_PER_DAY * durationDays;
      
      const participants = new Map(quest.participants.map(p => [p.playerId, p.xp]));
      finalReport.push(`--- Traitement XP Quête ${questId.substring(0, 6)} (Durée: ${durationDays}j, Seuil Malus: ${xpMalusThreshold} XP) ---`);

      for (const [playerId, player] of dbPlayerMap.entries()) {
        const memberInfo = clanMembers.get(playerId);
        
        // If player is exempt (leader or co-leader), skip
        if (memberInfo && (memberInfo.playerId === leaderId || memberInfo.isCoLeader)) {
          continue; 
        }

        const playerState = updates.get(playerId);
        
        // C. Verify participation and apply bonuses/maluses
        if (participants.has(playerId)) {
          let modifierChange = 0;
          const xp = participants.get(playerId);
          const bonus = Math.floor(xp / XP_BONUS_THRESHOLD);
          
          if (bonus > 0) {
            modifierChange -= bonus; // Bonus
            playerState.reports.push(`a gagné ${bonus} bonus (XP: ${xp}).`);
          } else if (xp < xpMalusThreshold) {
            modifierChange++; // Malus
            playerState.reports.push(`a reçu 1 malus (XP: ${xp} / Seuil: ${xpMalusThreshold}).`);
          }
          playerState.change += modifierChange;
        }
      }
      lastQuestTime = questEndTime; // Update last processed time
    }

    // Apply all updates to DB
    const dbUpdates = [];
    for (const [playerId, state] of updates.entries()) {
      if (state.change !== 0) {
        dbUpdates.push({
          player_id: playerId,
          clan_id: clanId,
          amount: state.change
        });
        const newModifier = (dbPlayerMap.get(playerId).quest_modifier + state.change) * -1;
        finalReport.push(`**${dbPlayerMap.get(playerId).username}** : ${state.reports.join(' ')} (Total: ${newModifier})`);
      }
    }

    if (dbUpdates.length > 0) {
      for (const update of dbUpdates) {
        await supabase.rpc('update_quest_modifier', {
          p_player_id: update.player_id,
          p_clan_id: update.clan_id,
          p_amount: update.amount
        });
      }
      console.log(`[Quests Fin] ${dbUpdates.length} joueurs mis à jour.`);
      
      // Send detailed report to leaders
      if (finalReport.length > 1) { // If more than just the header
        let reportMsg = "📊 **Rapport Bonus/Malus (XP de fin de quête)** 📊\n";
        for (const line of finalReport) {
          if (reportMsg.length + line.length > 1900) {
            await channel.send(reportMsg);
            reportMsg = "";
          }
          reportMsg += line + "\n";
        }
        await channel.send(reportMsg);

        // Send bonus announcement
        const announcementText = await generateBonusAnnouncement(clanId);
        await channel.send(announcementText);
      }

      console.log("[Quests Fin] Génération de l'annonce à copier/coller...");
    }

    // Update last processed quest time in DB
    await supabase.from('bot_state').upsert({
      clan_id: clanId,
      key: 'last_processed_quest_time',
      value: lastQuestTime.toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur lors du traitement des quêtes terminées:", error.message);
    if (channel) await channel.send(`❌ Erreur lors du traitement des quêtes : ${error.message}`);
  }
}

module.exports = processCompletedQuests;