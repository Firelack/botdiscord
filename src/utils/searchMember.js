/**
 * Searches for a clan member by username or partial nickname (case-insensitive, contains) within the clan members.
 * Returns the unique match's ID and username, or an error object if no unique match is found.
 * @param {string} nickname - The partial or full username to search for.
 * @param {string} clanId - The ID of the clan.
 * @param {object} axios - Axios instance.
 * @param {object} headers - Headers for the API request.
 * @returns {Promise<{userId: string, username: string} | {error: string}>}
 */
async function searchMember(nickname, clanId, axios, headers) {
  const searchName = nickname.toLowerCase();

  try {
    // 1. Fetch all clan members
    // Note: The API /clans/{clanId}/members does not have pagination built-in like the clanMembers command handles, 
    // but the default unpaginated endpoint is used here for simplicity, assuming clan size is manageable.
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
        userId: uniqueMatch.playerId, // Clan member list uses playerId
        username: uniqueMatch.username,
      };
    } else if (matches.length === 0) {
      // No match found
      return {
        error: `⚠️ Joueur introuvable (surnom "${nickname}" non trouvé dans le clan).`,
      };
    } else {
      // Multiple matches found
      const usernames = matches.map(m => m.username).join(', ');
      return {
        error: `⚠️ Surnom ambigu ("${nickname}" correspond à plusieurs joueurs : ${usernames}). Veuillez être plus spécifique.`,
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