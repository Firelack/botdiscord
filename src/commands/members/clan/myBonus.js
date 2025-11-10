const supabase = require('../../../utils/superbaseClient');

const MALUS_PAYMENT = 400; // Cost increase per malus

/**
 * Command for a clan member to check their own bonus/malus status.
 * mybonus
 */
async function myBonus(message, clanId) {
  if (!message.content.toLowerCase().startsWith("mybonus")) return;

  const usernameToSearch = message.member ? message.member.displayName : message.author.username;
  
  try {
     let { data: player, error } = await supabase
      .from('players')
      .select('quest_modifier, username')
      .eq('clan_id', clanId)
      .eq('in_clan', true)
      .ilike('username', usernameToSearch) // Search case-insensitive
      .single();

    if (error || !player) {
       message.reply(`Je n'ai pas pu te trouver dans la base de données du clan (recherche avec : \`${usernameToSearch}\`). Ton surnom sur ce serveur correspond-il à ton pseudo en jeu ?`);
       return;
    }

    const modifier = player.quest_modifier;
    
    if (modifier === 0) {
      message.reply(`Salut **${player.username}** ! Tu es à jour, tu n'as ni bonus ni malus (0).`);
    } else if (modifier < 0) {
      // -1 in DB = +1 bonus
      message.reply(`Salut **${player.username}** ! Tu as **${modifier * -1} quête(s) gratuite(s)** (bonus).`);
    } else {
      // +1 in DB = +1 malus
      const cost = 400 + (modifier * MALUS_PAYMENT);
      message.reply(`Salut **${player.username}** ! Tu as **${modifier} malus**. Ta prochaine quête coûtera **${cost}** or.`);
    }

  } catch (err) {
    if (err.code !== 'PGRST116') { // 'PGRST116' = no rows found for single()
      message.reply("Erreur lors de la récupération de ton statut.");
      console.error(err);
    }
  }
}

module.exports = myBonus;