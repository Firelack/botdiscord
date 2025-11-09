const supabase = require('./superbaseClient');

/**
 * Fetch a specific quest by its number from the available quests of a clan.
 * @param {string} clanId - The ID of the clan.
 * @param {object} axios - The axios instance for making HTTP requests.
 * @param {object} headers - The headers for the HTTP requests.
 * @param {number} questNumber - The 1-based index of the quest to fetch.
 * @return {object|null} - The quest object if found, otherwise null.
 */
async function getSpecificQuest(clanId, axios, headers, questNumber) {
  try {
    // Fetch available quests and votes in parallel
    const [availableRes, votesRes] = await Promise.all([
      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/available`, { headers }),
      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/votes`, { headers })
    ]);

    const availableQuests = availableRes.data;
    const votes = votesRes.data.votes;
    const questIndex = questNumber - 1; // Convert to 0-based index

    // Validate quest number
    if (questIndex < 0 || questIndex >= availableQuests.length) {
      console.error(`Numéro de quête invalide : ${questNumber}. Quêtes dispo : ${availableQuests.length}`);
      return null;
    }

    const quest = availableQuests[questIndex];

    // Format and return the quest object
    const url = quest.promoImageUrl;
    const match = url.match(/\/([^\/]+)\.jpg$/);
    const extractedName = match ? match[1] : 'NomInconnu';

    return {
      ...quest,
      questNumber: questNumber,
      extractedName: extractedName,
      voteCount: votes[quest.id] ? votes[quest.id].length : 0
    };
  
  } catch (error) {
    console.error("Erreur lors de la récupération de la quête spécifique:", error);
    return null;
  }
}

module.exports = getSpecificQuest;