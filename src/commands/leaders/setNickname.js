const supabase = require('../../utils/superbaseClient');
const findPlayer = require('../../utils/findPlayer.js');

/**
 * Sets or removes a player's nickname within a clan.
 * Format : nickname:PlayerName:NewNickname
 * If NewNickname is empty, the nickname is removed.
 * @param {Object} message - The Discord message object.
 * @param {string} clanId - The ID of the clan.
 * @param {Object} axios - Axios instance for HTTP requests.
 * @param {Object} headers - Headers for HTTP requests.
 */
async function setNickname(message, clanId, axios, headers) {
  if (!message.content.toLowerCase().startsWith("surnom:")) return;

  const args = message.content.substring(7).trim();
  const parts = args.split(':');

  if (parts.length < 2) {
    message.reply("Format invalide. Utilise : `surnom:NomDuJoueur:NouveauSurnom` (laisse le surnom vide pour le supprimer).");
    return;
  }

  const playerName = parts[0].trim();
  const newNickname = parts[1].trim() || null;

  // Find the target player
  const searchResult = await findPlayer(playerName, clanId, axios, headers);

  if (searchResult.error) {
    message.reply(searchResult.error);
    return;
  }
  if (searchResult.ambiguous) {
    message.reply(`⚠️ Surnom ambigu ("${playerName}" correspond à ${searchResult.matches.map(m => m.username).join(', ')}).`);
    return;
  }

  const { userId: targetPlayerId, username: targetUsername } = searchResult.unique;

  // Ensure the new nickname is not already taken by another player in the same clan
  if (newNickname) {
    let { data: existing, error } = await supabase
      .from('players')
      .select('username, player_id')
      .eq('nickname', newNickname)
      .eq('in_clan', true)
      .eq('clan_id', clanId)
      .single();
      
    if (existing) {
      // If we found an existing nickname, check if it's the same player
      if (existing.player_id === targetPlayerId) {
        message.reply(`ℹ️ C'est déjà le surnom de **${targetUsername}**.`);
        return;
      } else {
        message.reply(`❌ Erreur : Le surnom "${newNickname}" est déjà pris par **${existing.username}** dans ce clan.`);
        return;
      }
    }
  }

  // Update the player's nickname
  try {
    const { error: updateError } = await supabase
      .from('players')
      .update({ nickname: newNickname })
      .eq('player_id', targetPlayerId)
      .eq('clan_id', clanId);

    if (updateError) throw updateError;

    if (newNickname) {
      message.reply(`✅ Le surnom de **${targetUsername}** est maintenant **${newNickname}**.`);
    } else {
      message.reply(`✅ Le surnom de **${targetUsername}** a été supprimé.`);
    }

  } catch (error) {
    if (error.code === '23505') { // Error code for unique constraint violation in Supabase/PostgreSQL
      message.reply(`❌ Erreur : Le surnom "${newNickname}" est déjà assigné (potentiellement à un ancien membre de ce clan).`);
    } else {
      message.reply("❌ Une erreur est survenue lors de la mise à jour du surnom.");
      console.error(error);
    }
  }
}

module.exports = setNickname;