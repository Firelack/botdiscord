const supabase = require('../../utils/superbaseClient');
const findPlayer = require('../../utils/findPlayer');

/**
 * Manually add bonus/malus to players' quest modifiers.
 * Format: !addbonus name1 X name2 Y name3 Z
 * (X > 0 = Bonus, X < 0 = Malus)
 * @param {Object} message - The message object from Discord.
 * @param {number} clanId - The clan ID.
 * @param {Object} axios - Axios instance for HTTP requests.
 * @param {Object} headers - Headers for HTTP requests.
 * @return {void}
 */
async function addBonusMalus(message, clanId, axios, headers) {
  if (!message.content.toLowerCase().startsWith("addbonus")) return;

  const argsString = message.content.substring(9).trim();
  if (!argsString) {
    message.reply("Format invalide. Utilise : `addbonus Joueur1 X, Joueur2 Y`");
    return;
  }

  const args = argsString.split(' ');
  let reports = ["**📊 Rapport d'AJOUT Bonus/Malus 📊**"];
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
    const dbModifierChange = amount * -1; 

    // Find player in DB
    const searchResult = await findPlayer(playerName, clanId, axios, headers);

    if (searchResult.unique) {
      dbUpdates.push({
        player_id: searchResult.unique.userId,
        username: searchResult.unique.username,
        amount_change: dbModifierChange, // Change to apply in DB
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
        // Call the RPC to update quest modifier
        await supabase.rpc('update_quest_modifier', {
          p_player_id: update.player_id,
          p_clan_id: clanId,
          p_amount: update.amount_change
        });
        
        let { data: updatedPlayer } = await supabase
          .from('players')
          .select('quest_modifier')
          .eq('player_id', update.player_id)
          .eq('clan_id', clanId)
          .single();

        reports.push(`**${update.username}** : ${update.report_amount > 0 ? '+' : ''}${update.report_amount} (Nouveau total: **${updatedPlayer.quest_modifier * -1}**)`);

      } catch (err) {
        reports.push(`Erreur DB pour **${update.username}** : ${err.message}`);
      }
    }
  }

  message.reply(reports.join('\n'));
}

module.exports = addBonusMalus;