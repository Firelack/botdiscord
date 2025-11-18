const supabase = require('./superbaseClient');

/**
 * Research a player in the database by nickname or username.
 * 1. Searches an exact nickname (case-sensitive).
 * 2. Searches an exact username (case-insensitive).
 * 3. Searches partial username matches (case-insensitive).
 * @param {string} searchTerm - The nickname or username to search for.
 * @param {number} clanId - The clan ID to filter players by.
 * @param {object} axios - Axios instance for HTTP requests (not used here but kept for consistency).
 * @param {object} headers - Headers for HTTP requests (not used here but kept for consistency).
 * @returns {object} - An object containing either a unique match, ambiguous matches, or an error message.
 */
async function findPlayer(searchTerm, clanId, axios, headers) {
  const searchName = searchTerm.toLowerCase();

  // Search by Nickname (DB) - Exact (case-sensitive)
  try {
    let { data: dbMatch, error } = await supabase
      .from('players')
      .select('player_id, username')
      .eq('nickname', searchTerm) // Case-sensitive exact match
      .eq('in_clan', true)
      .eq('clan_id', clanId)
      .single();

    if (dbMatch) {
      return { unique: { userId: dbMatch.player_id, username: dbMatch.username } };
    }
  } catch (err) {
    if (err.code !== 'PGRST116') console.error("Erreur recherche Surnom DB:", err);
  }
  
  // Search by Username (DB) - Exact (case-insensitive)
  try {
    let { data: exactUsernameMatch, error } = await supabase
      .from('players')
      .select('player_id, username')
      .ilike('username', searchName) // Case-insensitive exact match
      .eq('in_clan', true)
      .eq('clan_id', clanId)
      .single(); // Need to be unique

    if (exactUsernameMatch) {
      return { unique: { userId: exactUsernameMatch.player_id, username: exactUsernameMatch.username } };
    }
  } catch (err) {
     if (err.code !== 'PGRST116') console.error("Erreur recherche Pseudo Exact DB:", err);
  }

  // If no exact match, search for partial matches (case-insensitive)
  try {
    let { data: partialMatches, error } = await supabase
      .from('players')
      .select('player_id, username')
      .ilike('username', `%${searchName}%`) // Case-insensitive partial match
      .eq('in_clan', true)
      .eq('clan_id', clanId);

    if (error) throw error;

    // Analyze partial matches
    if (partialMatches.length === 1) {
      const uniqueMatch = partialMatches[0];
      return {
        unique: {
          userId: uniqueMatch.player_id,
          username: uniqueMatch.username,
        },
      };
    } else if (partialMatches.length === 0) {
      return {
        error: `⚠️ Joueur introuvable (terme "${searchTerm}" non trouvé dans la DB).`,
      };
    } else {
      // Multiple partial matches found
      return {
        ambiguous: true,
        matches: partialMatches.map(m => ({ userId: m.player_id, username: m.username })),
        nickname: searchTerm,
      };
    }

  } catch (error) {
    console.error("Erreur lors de la recherche partielle DB:", error.message);
    return {
      error: "❌ Une erreur s'est produite lors de la recherche en base de données.",
    };
  }
}

module.exports = findPlayer;