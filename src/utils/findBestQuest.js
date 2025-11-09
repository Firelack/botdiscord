const supabase = require('./superbaseClient');

/**
 * Find the best quest for a clan based on votes, gem settings, and recent history.
 * @param {string} clanId - The ID of the clan.
 * @param {object} axios - The axios instance for making HTTP requests.
 * @param {object} headers - The headers to include in the API requests.
 * * @returns {object|null} The best quest object or null if none found.
 */
async function findBestQuest(clanId, axios, headers) {
    
  // Fetch gem quest configuration from the database
  let { data: gemConfig } = await supabase
    .from('bot_state')
    .select('value')
    .eq('clan_id', clanId)
    .eq('key', 'allow_gem_quests')
    .single();
    
  // Gems quests allowed by default unless explicitly set to 'false'
  const allowGems = (gemConfig && gemConfig.value === 'false') ? false : true; 
  
  try {
    // Fetch available quests, votes, and history
    const [availableRes, votesRes, historyRes] = await Promise.all([
      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/available`, { headers }),
      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/votes`, { headers }),
      axios.get(`https://api.wolvesville.com/clans/${clanId}/quests/history`, { headers })
    ]);

    const availableQuests = availableRes.data;
    const votes = votesRes.data.votes;
    const history = historyRes.data;

    // Create a set of quest IDs completed in the last 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentQuestIds = new Set(
      history
        .filter(h => new Date(h.tierStartTime) > oneWeekAgo)
        .map(h => h.quest.id)
    );

    // Extract quest numbers and filter eligible quests
    let mappedQuests = availableQuests.map((quest, index) => {
      const url = quest.promoImageUrl;
      // Regex to extract the quest name from the URL
      const match = url.match(/\/([^\/]+)\.jpg$/);
      const extractedName = match ? match[1] : 'NomInconnu';

      return {
        ...quest,
        questNumber: index + 1, // Numbering starts at 1
        extractedName: extractedName, // Name extracted from URL
        voteCount: votes[quest.id] ? votes[quest.id].length : 0
      };
    });

    // Filter quests based on criteria
    let eligibleQuests = mappedQuests.filter(quest => {
      // Exclude if completed recently
      if (recentQuestIds.has(quest.id)) return false;
      
      // Exclude if gems not allowed and quest requires gems
      if (!allowGems && quest.purchasableWithGems) return false;

      return true;
    });

    // Sort quests by vote count in descending order
    eligibleQuests.sort((a, b) => b.voteCount - a.voteCount);
    
    // Return the top quest or null if none eligible
    return eligibleQuests.length > 0 ? eligibleQuests[0] : null;

  } catch (error) {
      console.error("Erreur lors de la recherche de la meilleure quête:", error);
      return null;
  }
}

module.exports = findBestQuest;