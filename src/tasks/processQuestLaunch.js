const supabase = require('../utils/superbaseClient');
const generateBonusAnnouncement = require('../commands/leaders/generateBonusAnnouncement.js');

const MALUS_PAYMENT = 400;

/**
 * Trigger 1: Process quest launch.
 * Apply bonuses/maluses.
 * @param {string} clanId - The ID of the clan.
 * @param {object} activeQuest - The active quest object.
 * @param {object} axios - The axios instance for making HTTP requests.
 * @param {object} headers - The headers to include in the request.
 * @param {object} client - The Discord client instance.
 * @param {string} leaderChannelId - The ID of the Discord channel for leader reports.
 * @returns {Promise<void>}
 */
async function processQuestLaunch(clanId, activeQuest, axios, headers, client, leaderChannelId) {
  const channel = client.channels.cache.get(leaderChannelId);
  if (!channel) return;

  console.log(`[Launch] Traitement du lancement de la quête ${activeQuest.quest.id}`);

  try {
    // Fetch end time of last processed quest
    let { data: lastQuestState } = await supabase
      .from('bot_state')
      .select('value')
      .eq('clan_id', clanId)
      .eq('key', 'last_processed_quest_time')
      .single();
    
    // If never processed, default to now
    const lastQuestTime = lastQuestState ? new Date(lastQuestState.value) : new Date(Date.now());
    const launchTime = new Date(activeQuest.tierStartTime);

    // Fetch votes, ledger, members and clan info in parallel
    const [votesRes, ledgerRes, membersRes, clanInfoRes] = await Promise.all([
      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/votes`, { headers }),
      axios.get(`https://api.wolvesville.com/clans/${clanId}/ledger`, { headers }),
      axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers }),
      axios.get(`https://api.wolvesville.com/clans/${clanId}/info`, { headers })
    ]);

    const leaderId = clanInfoRes.data.leaderId;

    // Fetch players from DB
    let { data: dbPlayers } = await supabase
      .from('players')
      .select('player_id, username, quest_modifier')
      .eq('clan_id', clanId)
      .eq('in_clan', true);
    
    if (!dbPlayers) dbPlayers = [];
    const dbPlayerMap = new Map(dbPlayers.map(p => [p.player_id, p]));

    // Prepare data structures
    const questId = activeQuest.quest.id;
    const voterIds = new Set(votesRes.data.votes[questId] || []);
    const participantIds = new Set(activeQuest.participants.map(p => p.playerId));
    const clanMembers = new Map(membersRes.data.map(m => [m.playerId, m]));
    
    // Filter ledger for donations between last quest and launch time
    const donations = ledgerRes.data.filter(e => 
      e.type === 'DONATE' && 
      new Date(e.creationTime) > lastQuestTime && 
      new Date(e.creationTime) < launchTime
    );

    let finalReport = [`**📊 Rapport de Lancement (Quête ${questId.substring(0, 6)})**`];
    const dbUpdates = [];

    // On all players in DB
    for (const [playerId, player] of dbPlayerMap.entries()) {
      const memberInfo = clanMembers.get(playerId);
      
      // Exempt leader and co-leaders
      if (memberInfo && (memberInfo.playerId === leaderId || memberInfo.isCoLeader)) {
        continue;
      }

      let modifierChange = 0;
      let reports = [];
      const currentModifier = player.quest_modifier;
      let didPay = false;

      const playerDonations = donations.filter(d => d.playerId === playerId);

      // A1. Free quest usage
      const freeQuestDonation = playerDonations.find(d => 
        d.message && (d.message.toLowerCase().includes('quête gratuite') || d.message.toLowerCase().includes('raison'))
      );
      
      if (freeQuestDonation && currentModifier < 0) {
        modifierChange++;
        didPay = true;
        reports.push("a utilisé 1 quête gratuite.");
      }

      // A2. Malus payment
      if (!didPay && currentModifier > 0) {
        const requiredPayment = 400 + (currentModifier * MALUS_PAYMENT);
        if (playerDonations.some(d => d.gold >= requiredPayment)) {
          modifierChange = -currentModifier;
          didPay = true;
          reports.push(`a payé ${requiredPayment} or (a annulé ${currentModifier} malus).`);
        }
      }
      
      // A3. Normal payment check
      if (!didPay && currentModifier <= 0) {
        if (playerDonations.some(d => d.gold >= 400)) {
          didPay = true;
        }
      }

      // B. Vote without participation
      const voted = voterIds.has(playerId);
      const participating = participantIds.has(playerId);

      if (voted && !participating && !didPay) {
        modifierChange++;
        reports.push("a voté mais ne participe pas (Malus +1).");
      }

      // C. Apply changes if any
      if (modifierChange !== 0) {
        dbUpdates.push({
          player_id: playerId,
          clan_id: clanId,
          amount: modifierChange
        });
        const newTotal = (currentModifier + modifierChange) * -1;
        reports.push(`Total: ${newTotal}`);
        finalReport.push(`**${player.username}** : ${reports.join(' ')}`);
      }
    }

    // Apply all DB updates
    if (dbUpdates.length > 0) {
      for (const update of dbUpdates) {
        await supabase.rpc('update_quest_modifier', {
          p_player_id: update.player_id,
          p_clan_id: update.clan_id,
          p_amount: update.amount
        });
      }
    }

    // Send detailed report to leaders
    if (finalReport.length > 1) {
      await channel.send(finalReport.join('\n'));
    }
      // Send bonus announcement
      console.log("[Quest Started] Génération de l'annonce à copier/coller...");
      const announcementText = await generateBonusAnnouncement(clanId);
      await channel.send(announcementText);


  } catch (error) {
    console.error("❌ Erreur lors du traitement de lancement de quête:", error.message);
    await channel.send(`❌ Erreur lors du traitement de lancement de la quête ${activeQuest.quest.id} : ${error.message}`);
  }
}

module.exports = processQuestLaunch;