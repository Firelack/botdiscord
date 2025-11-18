const supabase = require('../../utils/superbaseClient');

/**
 * Command to toggle gem quests announcements
 * togglegems
 * @param {object} message - The Discord message object
 * @param {string} clanId - The clan ID
 * @return {void}
 */
async function toggleGemQuests(message, clanId) {
  if (message.content.toLowerCase() !== "togglegems") return;

  const key = 'allow_gem_quests';
  
  // Read current status from DB
  let { data } = await supabase
    .from('bot_state')
    .select('value')
    .eq('clan_id', clanId)
    .eq('key', key)
    .single();

  // Determine new status
  const wasEnabled = !data || data.value === 'true'; // Default to true if no entry
  const newStatus = !wasEnabled; // Toggle status

  // Update status in DB
  const { error } = await supabase.from('bot_state').upsert({
    clan_id: clanId,
    key: key,
    value: newStatus.toString()
  });

  if (error) {
    message.reply("❌ Une erreur est survenue lors de la mise à jour des paramètres.");
    console.error(error);
  } else {
    message.reply(newStatus 
      ? "✅ Les quêtes en gemmes sont maintenant **incluses** dans les annonces."
      : "⛔ Les quêtes en gemmes sont maintenant **exclues** des annonces."
    );
  }
}

module.exports = toggleGemQuests;