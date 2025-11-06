/**
 * Searches for a clan member by username or partial nickname (case-insensitive, contains) within the clan members.
 * Returns a match object: { unique: { userId, username } } on success,
 * { error: string } on no match, or { ambiguous: true, matches: [{ userId, username }, ...], nickname: string } on multiple matches.
 * @param {string} nickname - The partial or full username to search for.
 * @param {string} clanId - The ID of the clan.
 * @param {object} axios - Axios instance.
 * @param {object} headers - Headers for the API request.
 * @returns {Promise<{unique: {userId: string, username: string}} | {error: string} | {ambiguous: true, matches: Array<{userId: string, username: string}>, nickname: string}>}
 */
async function searchMember(nickname, clanId, axios, headers) {
  const searchName = nickname.toLowerCase();

  try {
    // 1. Fetch all clan members
    const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers });
    const members = response.data;

    // 2. Filter members whose username contains the nickname (case-insensitive)
    const matches = members.filter(member =>
      member.username.toLowerCase().includes(searchName)
    );

    // 3. Handle results
    if (matches.length === 1) {
      // Unique match found
      const uniqueMatch = matches[0];
      return {
        unique: { // Clé 'unique' pour succès
          userId: uniqueMatch.playerId, // Clan member list uses playerId
          username: uniqueMatch.username,
        },
      };
    } else if (matches.length === 0) {
      // No match found
      return {
        error: `⚠️ Joueur introuvable (surnom "${nickname}" non trouvé dans le clan).`,
      };
    } else {
      // Multiple matches found - ambiguous
      return {
        ambiguous: true,
        matches: matches.map(m => ({ userId: m.playerId, username: m.username })),
        nickname: nickname, // Return the original nickname for reference
      };
    }

  } catch (error) {
    console.error("Erreur lors de la recherche de membre dans le clan:", error.message);
    return {
      error: "❌ Une erreur s'est produite lors de la récupération de la liste des membres du clan.",
    };
  }
}

module.exports = searchMember;