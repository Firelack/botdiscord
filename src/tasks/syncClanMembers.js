const supabase = require('../utils/superbaseClient');

/**
 * Synchronizes clan members between the Wolvesville API and the local database for a specific clan.
 * Marks players who have left the clan and updates/creates records for current members.
 * @param {string} clanId - The ID of the clan to synchronize.
 * @param {Object} axios - Axios instance for HTTP requests.
 * @param {Object} headers - Headers for HTTP requests.
 */
async function syncClanMembers(clanId, axios, headers) {
  if (!clanId) {
    console.error("syncClanMembers a été appelé sans clanId.");
    return;
  }
  console.log(`🔄 Démarrage de la synchronisation des membres pour le clan ${clanId}...`);
  
  try {
    // Fetch current clan members from Wolvesville API
    const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers });
    const apiMembers = response.data;
    const apiMemberIds = new Set(apiMembers.map(m => m.playerId));

    // Fetch current players from the database for this clan
    let { data: dbPlayers, error: dbError } = await supabase
      .from('players')
      .select('player_id, in_clan')
      .eq('clan_id', clanId);
      
    if (dbError) throw dbError;

    // Whrite if any players have left the clan
    const playersToMarkAsLeft = dbPlayers
      .filter(p => p.in_clan && !apiMemberIds.has(p.player_id))
      .map(p => p.player_id);

    if (playersToMarkAsLeft.length > 0) {
      console.log(`Marquage de ${playersToMarkAsLeft.length} membre(s) comme 'parti' (Clan ${clanId}).`);
      await supabase
        .from('players')
        .update({ in_clan: false, nickname: null }) // Delete nickname when leaving
        .in('player_id', playersToMarkAsLeft)
        .eq('clan_id', clanId);
    }

    // Update or insert current members
    const playersToUpsert = apiMembers.map(m => ({
      player_id: m.playerId,
      username: m.username,
      in_clan: true,
      clan_id: clanId
    }));

    if (playersToUpsert.length > 0) {
      let { error: upsertError } = await supabase
        .from('players')
        .upsert(playersToUpsert, { onConflict: 'player_id, clan_id' });
        
      if (upsertError) throw upsertError;
    }
    
    console.log(`✔️ Synchronisation terminée (Clan ${clanId}). ${playersToUpsert.length} membres à jour.`);

  } catch (error) {
    console.error(`❌ Erreur lors de la synchronisation des membres (Clan ${clanId}):`, error.message);
  }
}

module.exports = syncClanMembers;