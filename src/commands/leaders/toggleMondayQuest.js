const supabase = require('../../utils/superbaseClient');

/**
 * Command to toggle Monday 8 PM quest announcement
 * @param {object} message - The Discord message object
 * @param {string} clanId - The clan ID
 * togglequest
 */
async function toggleMondayQuest(message, clanId) {
  if (message.content.toLowerCase() !== "togglequest") return;

  const key = 'enable_monday_announcement';
  
  // Read current status from DB
  let { data } = await supabase
    .from('bot_state')
    .select('value')
    .eq('clan_id', clanId)
    .eq('key', key)
    .single();

  // Determine new status
  const wasEnabled = data && data.value === 'true';
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
      ? "✅ L'annonce automatique du Lundi 20h est maintenant **activée**."
      : "⛔ L'annonce automatique du Lundi 20h est maintenant **désactivée**."
    );
  }
}

module.exports = toggleMondayQuest;