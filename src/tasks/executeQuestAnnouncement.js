const findBestQuest = require('../utils/findBestQuest.js');
const getSpecificQuest = require('../utils/getSpecificQuest.js');
const postAnnouncement = require('./postAnnouncement.js');
const supabase = require('../utils/superbaseClient');
const { translate } = require('@vitalets/google-translate-api');

/**
 * Capitalize the first letter of a string
 * @param {string} s - The string to capitalize
 * @returns {string}
 */
function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Format quest key for translation
 * @param {string} key - The quest key
 * @returns {string}
 */
function formatKeyForTranslation(key) {
  return key
    .replace(/_/g, ' ') // "wolf_hunter" -> "wolf hunter"
    .replace(/([a-z])([A-Z])/g, '$1 $2'); // "stayAtHome" -> "stay At Home"
}

/**
 * Get the translated quest name, using cache if available.
 * @param {string} questKey - Name key of the quest
 * @returns {object} { questName, akaName }
 */
async function getQuestName(questKey) {
  if (!questKey) return { questName: "Quête Inconnue", akaName: '\n' };

  const key = questKey.toLowerCase();
  const defaultName = capitalize(key.replace(/_/g, ' '));
  let akaName = `\n`;

  // Lookup in cache (Supabase)
  try {
    let { data } = await supabase
      .from('quest_translations')
      .select('name_fr')
      .eq('quest_key', key)
      .single();

    if (data && data.name_fr) {
      // Found in cache
      const questName = data.name_fr;
      if (questName.toLowerCase() !== key && questName.toLowerCase() !== defaultName.toLowerCase()) {
        akaName = `(aka ${defaultName})\n\n`;
      }
      return { questName, akaName };
    }
  } catch (dbError) {
    if (dbError.code !== 'PGRST116') { // PGRST116 = not found
      console.warn(`Erreur lecture cache DB pour ${key}:`, dbError.message);
    }
  }

  // Not found in cache, proceed to translate
  try {
    const textToTranslate = formatKeyForTranslation(key);
    const { text } = await translate(textToTranslate, { from: 'en', to: 'fr' });
    
    const translatedName = capitalize(text); // ex: "Forgeron"

    // Store in cache
    try {
      await supabase
        .from('quest_translations')
        .insert({ quest_key: key, name_fr: translatedName });
    } catch (dbInsertError) {
      console.warn(`Erreur sauvegarde cache DB pour ${key}:`, dbInsertError.message);
    }

    if (translatedName.toLowerCase() !== key && translatedName.toLowerCase() !== defaultName.toLowerCase()) {
      akaName = `(aka ${defaultName})\n\n`;
    }
    return { questName: translatedName, akaName };

  } catch (translateError) {
    // If translation fails, return default name
    console.error(`Échec de la traduction pour "${key}":`, translateError.message);
    return { questName: defaultName, akaName: '\n' };
  }
}


/**
 * Logic to execute quest announcement
 * @param {string} clanId - The ID of the clan.
 * @param {object} axios - Instance Axios.
 * @param {object} headers - Headers API.
 * @param {string} launchTime - When the quest will launch (e.g., "Mardi 20h00").
 * @param {object|null} message - The Discord message object (or null for auto).
 * @param {number|null} questNumber - Optional 1-based index of the quest to announce.
 * @return {void}
 */
async function executeQuestAnnouncement(clanId, axios, headers, launchTime, message = null, questNumber = null) {
  
  let questToAnnounce = null;

  if (questNumber !== null) {
    // If a specific quest number is provided
    if (message) {
      await message.reply(`🔄 Recherche de la quête **n°${questNumber}**...`);
    }
    questToAnnounce = await getSpecificQuest(clanId, axios, headers, questNumber);
    
    if (!questToAnnounce) {
      const errorMsg = `❌ Quête n°${questNumber} introuvable. Vérifiez le numéro de quête (1, 2, 3...).`;
      if (message) await message.reply(errorMsg);
      else console.log(`(Annonce auto) ${errorMsg}`);
      return;
    }

  } else {
    // Else, find the best quest automatically
    if (message) {
      await message.reply("🔄 Recherche de la *meilleure* quête en cours...");
    }
    questToAnnounce = await findBestQuest(clanId, axios, headers);
  }


  // If no quest found, notify and exit
  if (!questToAnnounce) {
    const errorMsg = "❌ Aucune quête éligible n'a été trouvée (vérifiez les votes, l'historique et le filtre de gemmes).";
    if (message) {
      await message.reply(errorMsg);
    } else {
      console.log(`(Annonce auto) ${errorMsg}`);
    }
    return;
  }

  const currency = questToAnnounce.purchasableWithGems ? "gemmes" : "or";
  const questNum = questToAnnounce.questNumber; // Quest number
  
  // Lookup quest name
  const { questName, akaName } = await getQuestName(questToAnnounce.extractedName);

  let messageContent = 
    `📢 Prochaine quête ${launchTime} 📢\n\n` +
    `On lancera la quête n°${questNum} nommée ${questName} (${questToAnnounce.voteCount} votes)\n` +
    akaName +
    `Pour participer donnez ${currency === "gemmes" ? 80 : 400} ${currency}.\n\n` +
    `Pour les bonus et malus, référez vous à l'annonce correspondante !!`;

  // Send the announcement
  try {
    await postAnnouncement(axios, headers, clanId, messageContent);
    const successMsg = `✅ Annonce de quête envoyée pour **${launchTime}** !`;
    if (message) {
      await message.reply(successMsg);
    } else {
      console.log(`(Annonce auto) ${successMsg}`);
    }
  } catch (e) {
    const errorMsg = "❌ Une erreur est survenue lors de l'envoi de l'annonce.";
    if (message) {
      await message.reply(errorMsg);
    } else {
      console.error(errorMsg, e);
    }
  }
}

module.exports = executeQuestAnnouncement;