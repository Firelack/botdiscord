const supabase = require('../../utils/superbaseClient');
const findPlayer = require('../../utils/findPlayer');

/**
 * Manage setting bonus/malus for clan members.
 * Format: setbonus name1 X name2 Y name3 Z
 * (X > 0 = Bonus, X < 0 = Malus)
 * @param {Object} message - The message object from Discord.
 * @param {number} clanId - The clan ID.
 * @param {Object} axios - Axios instance for HTTP requests.
 * @param {Object} headers - Headers for HTTP requests.
 * @return {void}
 */
async function setBonusMalus(message, clanId, axios, headers) {
  if (!message.content.toLowerCase().startsWith("setbonus")) return;

  const argsString = message.content.substring(9).trim();
  if (!argsString) {
    message.reply("Format invalide. Utilise : `setbonus Joueur1 X, Joueur2 Y`");
    return;
  }

  const args = argsString.split(',');
  let reports = ["**📊 Rapport de DÉFINITION Bonus/Malus 📊**"];
  const dbUpdates = [];

  for (const arg of args) {
    const parts = arg.trim().split(' ');
    if (parts.length < 2) {
      reports.push(`Format invalide pour "${arg}".`);
      continue;
    }

    const amountStr = parts.pop();
    const playerName = parts.join(' ').trim();
    const amount = parseInt(amountStr, 10);

    if (isNaN(amount)) {
      reports.push(`Montant invalide pour "${playerName}".`);
      continue;
    }
    
    // Traduce for bonus/malus to DB modifier change
    const dbModifierValue = amount * -1; 

    // Find player in DB
    const searchResult = await findPlayer(playerName, clanId, axios, headers);

    if (searchResult.unique) {
      dbUpdates.push({
        player_id: searchResult.unique.userId,
        username: searchResult.unique.username,
        amount_to_set: dbModifierValue, // Value to set in DB
        report_amount: amount // Amount to report back
      });
    } else if (searchResult.ambiguous) {
      reports.push(`Terme ambigu "${playerName}" : ${searchResult.matches.map(m => m.username).join(', ')}`);
    } else {
      reports.push(`Joueur "${playerName}" introuvable.`);
    }
  }

  // Apply DB updates
  if (dbUpdates.length > 0) {
    for (const update of dbUpdates) {
      try {
        const { error } = await supabase
          .from('players')
          .update({ quest_modifier: update.amount_to_set })
          .eq('player_id', update.player_id)
          .eq('clan_id', clanId);

        if (error) throw error;
        
        reports.push(`**${update.username}** : Défini à **${update.report_amount}**.`);

      } catch (err) {
        reports.push(`Erreur DB pour **${update.username}** : ${err.message}`);
      }
    }
  }

  message.reply(reports.join('\n'));
}

module.exports = setBonusMalus;