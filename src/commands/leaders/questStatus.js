const supabase = require('../../utils/superbaseClient');

/**
 * Command to display the current quest status of all clan members.
 * statusquetes
 * @param {Object} message - The message object from Discord.
 * @param {number} clanId - The clan ID.
 * @return {void}
 */
async function questStatus(message, clanId) {
  if (!message.content.toLowerCase().startsWith("statusquetes")) return;

  try {
    // Fetch players from the database
    let { data: players, error } = await supabase
      .from('players')
      .select('username, quest_modifier')
      .eq('clan_id', clanId)
      .eq('in_clan', true);

    if (error) throw error;

    // Split players into bonus and malus
    const bonusPlayers = players
      .filter(p => p.quest_modifier < 0) // Bonus = negatif in DB
      .sort((a, b) => a.username.localeCompare(b.username)); // Sort alphabetically

    const malusPlayers = players
      .filter(p => p.quest_modifier > 0) // Malus = positif in DB
      .sort((a, b) => a.username.localeCompare(b.username));

    // Format bonus list
    let bonusList = bonusPlayers
      .map(p => `- ${p.username} : **${p.quest_modifier * -1}** quête(s) gratuite(s)`)
      .join('\n');
      
    if (bonusList.length === 0) {
      bonusList = "Aucun membre n'a de bonus.";
    }

    // Format malus list
    let malusList = malusPlayers
      .map(p => `- ${p.username} : **${p.quest_modifier}** malus`)
      .join('\n');

    if (malusList.length === 0) {
      malusList = "Aucun membre n'a de malus.";
    }
    
    // Send the report
    message.reply(
      `### ⭐ BONUS ⭐\n` +
      `${bonusList}\n` +
      `### 💔 MALUS 💔\n` +
      `${malusList}`
    );
    
  } catch (err) {
    message.reply("❌ Une erreur est survenue lors de la récupération du statut des quêtes.");
    console.error(err);
  }
}

module.exports = questStatus;