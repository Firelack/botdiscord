const searchMember = require('../../utils/searchMember.js');

/**
 * Executes a player participation change action (active/desactive) sequentially for a list of names.
 * This function uses a two-pass logic to resolve ambiguities where possible:
 * 1. Identify all unique matches and process them.
 * 2. Re-evaluate ambiguous matches, filtering out players already processed, potentially resolving the ambiguity.
 * @param {object} message - The Discord message object.
 * @param {string} clanId - The clan ID.
 * @param {object} axios - The Axios instance.
 * @param {object} headers - The API headers.
 * @param {string[]} profilNames - Array of nicknames to process.
 * @param {boolean} participateInQuests - true for activation, false for deactivation.
 * @param {string} actionWord - "activé" or "désactivé" for success message.
 */
async function processNameList(message, clanId, axios, headers, profilNames, participateInQuests, actionWord) {
  if (profilNames.length === 0) {
    return message.reply(`⚠️ Aucun nom de profil spécifié après l'action.`);
  }
  
  message.reply(`🔄 ${actionWord} de ${profilNames.length} joueur(s) en cours...`);

  // --- Pass 1: Identify all matches (Unique, Ambiguous, Error) ---
  // Using Promise.all to fetch all search results concurrently for efficiency
  const allSearchResults = await Promise.all(
    profilNames.map(async (profilName) => ({
      profilName, // Original input name
      result: await searchMember(profilName, clanId, axios, headers),
    }))
  );

  const processedUserIds = new Set();
  const results = [];
  
  // Helper to execute API action and format message
  const executeAction = async (userId, username, isResolvedAmbiguity = false) => {
    // Important: check if already processed (this can happen if a player is matched by two unique names)
    if (processedUserIds.has(userId)) return null; 

    try {
      await axios.put(
        `https://api.wolvesville.com/clans/${clanId}/members/${userId}/participateInQuests`,
        { participateInQuests: participateInQuests },
        { headers }
      );
      processedUserIds.add(userId);
      let msg = `✅ ${username} ${actionWord}`;
      if (isResolvedAmbiguity) {
        msg += ` (résolu par élimination)`;
      }
      return msg;
    } catch (e) {
      console.error(`Erreur lors de l'action pour ${username} (${userId}):`, e.response?.data || e.message);
      return `❌ Erreur lors de l'${actionWord} de ${username}`;
    }
  };

  // 1. Process unique matches (highest priority)
  const uniqueMatches = allSearchResults.filter(item => item.result.unique);

  for (const item of uniqueMatches) {
    const { userId, username } = item.result.unique;
    const msg = await executeAction(userId, username);
    if (msg) results.push(msg);
  }

  // 2. Resolve ambiguous matches based on processedUserIds
  const ambiguousMatches = allSearchResults.filter(item => item.result.ambiguous);

  for (const item of ambiguousMatches) {
    const { profilName, result } = item;
    const allMatches = result.matches;
    
    // Filter out players whose ID is already in processedUserIds (processed by a unique match above)
    const filteredMatches = allMatches.filter(match => !processedUserIds.has(match.userId));

    if (filteredMatches.length === 1) {
      // Ambiguity resolved! It is now a unique match among the remaining players.
      const uniqueMatch = filteredMatches[0];
      const msg = await executeAction(uniqueMatch.userId, uniqueMatch.username, true); // true for resolved ambiguity flag
      if (msg) results.push(msg);

    } else if (filteredMatches.length > 1) {
      // Still ambiguous, report the error with the remaining names
      const usernames = filteredMatches.map(m => m.username).join(', ');
      // New error message wording to reflect the filtering:
      results.push(`⚠️ Surnom ambigu ("${profilName}" correspond à plusieurs joueurs non traités : ${usernames}). Veuillez être plus spécifique.`);
      
    } else { 
      // filteredMatches.length === 0: All potential matches were already processed by other names. Ignore.
    }
  }

  // 3. Report explicit search errors (lowest priority)
  allSearchResults
    .filter(item => item.result.error)
    .forEach(item => {
      results.push(item.result.error);
    });


  if (results.length > 0) {
    message.reply(results.join("\n"));
  }
}

async function changeParticipations(message, clanId, salonId, axios, headers) {
  // === ACTIVE ONE OR MULTIPLE PLAYERS ===
  if (message.content.toLowerCase().startsWith("active:") && message.channel.id == salonId && !message.content.toLowerCase().includes("all")) {
    const rawNames = message.content.substring(7).trim();
    const profilNames = rawNames.split(",").map(n => n.trim()).filter(n => n.length > 0);
    
    await processNameList(message, clanId, axios, headers, profilNames, true, "activé");

  // === DESACTIVE ONE OR MULTIPLE PLAYERS ===
  } else if (message.content.toLowerCase().startsWith("desactive:") && message.channel.id == salonId && !message.content.toLowerCase().includes("all")) {
    const rawNames = message.content.substring(10).trim();
    const profilNames = rawNames.split(",").map(n => n.trim()).filter(n => n.length > 0);
    
    await processNameList(message, clanId, axios, headers, profilNames, false, "désactivé");

  // === DESACTIVE ALL ===
  } else if (message.content.toLowerCase() === "desactiveall:" && message.channel.id == salonId) {
    message.reply("🔄 Désactivation de tous les membres en cours...");

    axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers })
      .then(response => {
        const members = response.data;
        const promises = [];

        for (const member of members) {
          if (member.participateInClanQuests) {
            const p = axios.put(
              `https://api.wolvesville.com/clans/${clanId}/members/${member.playerId}/participateInQuests`,
              { participateInQuests: false },
              { headers }
            ).catch(err => console.error(`Erreur avec ${member.username}:`, err.response?.data || err.message));
            promises.push(p);
          }
        }

        Promise.all(promises)
          .then(() => {
            message.reply(`✅ Tous les membres (${promises.length}) ont été désactivés avec succès !`);
          })
          .catch(error => {
            message.reply("❌ Une erreur s'est produite lors de la désactivation collective.");
            console.error(error);
          });
      })
      .catch(error => {
        message.reply("❌ Impossible de récupérer la liste des membres du clan.");
        console.error(error);
      });

  // === ACTIVE ALL ===
  } else if (message.content.toLowerCase() === "activeall:" && message.channel.id == salonId) {
    message.reply("🔄 Activation de tous les membres en cours...");

    axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers })
      .then(response => {
        const members = response.data;
        const promises = [];

        for (const member of members) {
          if (!member.participateInClanQuests) {
            const p = axios.put(
              `https://api.wolvesville.com/clans/${clanId}/members/${member.playerId}/participateInQuests`,
              { participateInQuests: true },
              { headers }
            ).catch(err => console.error(`Erreur avec ${member.username}:`, err.response?.data || err.message));
            promises.push(p);
          }
        }

        Promise.all(promises)
          .then(() => {
            message.reply(`✅ Tous les membres (${promises.length}) ont été activés avec succès !`);
          })
          .catch(error => {
            message.reply("❌ Une erreur s'est produite lors de l'activation collective.");
            console.error(error);
          });
      })
      .catch(error => {
        message.reply("❌ Impossible de récupérer la liste des membres du clan.");
        console.error(error);
      });
  }
}

module.exports = changeParticipations;