const supabase = require('../../utils/superbaseClient');

/**
 * Generate a bonus/malus announcement for a clan based on players' quest modifiers.
 * @param {string} clanId - Clan ID to generate the announcement for.
 * @returns {string} - Formatted announcement message.
 */
async function generateBonusAnnouncement(clanId) {
  try {
    // Fetch players with non-zero quest modifiers
    let { data: players, error } = await supabase
      .from('players')
      .select('username, quest_modifier')
      .eq('clan_id', clanId)
      .eq('in_clan', true)
      .neq('quest_modifier', 0);

    if (error) throw error;

    // Split players into bonus and malus lists and sort them alphabetically
    const bonusPlayers = players
      .filter(p => p.quest_modifier < 0)
      .sort((a, b) => a.username.localeCompare(b.username));

    const malusPlayers = players
      .filter(p => p.quest_modifier > 0)
      .sort((a, b) => a.username.localeCompare(b.username));

    // Format the announcement message
    const bonusString = bonusPlayers
      .map(p => `${p.username} x${p.quest_modifier * -1}`)
      .join(', ');

    const malusString = malusPlayers
      .map(p => `${p.username} x${p.quest_modifier}`)
      .join(', ');

    // Build final message
    const finalMessage = 
      `Annonce des BONUS et MALUS :\n\n` +
      `Quête gratuite : ${bonusString.length > 0 ? bonusString : 'Personne'}\n` +
      `(Pour l'utiliser : donnez 1or au clan et précisez « quête gratuite » dans la raison. ARRETEZ DE METTRE RAISON ÇA VEUT RIEN DIRE)\n\n` +
      `Malus : ${malusString.length > 0 ? malusString : 'Personne'}\n` +
      `(Donnez 400*votre nombre de malus en plus des 400 de base pour participer)`;

    return finalMessage;

  } catch (err) {
    console.error("Erreur lors de la génération de l'annonce bonus/malus:", err);
    return "Erreur lors de la génération de l'annonce.";
  }
}

module.exports = generateBonusAnnouncement;