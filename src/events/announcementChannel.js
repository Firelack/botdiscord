// Import superbase client
const supabase = require('../utils/superbaseClient');

// In-memory cache of announcements (announcement_id -> discord_message_id)
let announcementsMap = new Map();

/**
 * Load announcements from Supabase into the in-memory map.
 * This function should be called at bot startup to restore state.
 * @return {Promise<void>}
 */
async function loadAnnouncementsFromDB() {
  const { data, error } = await supabase
    .from('announcements') // Table name
    .select('announcement_id, discord_message_id'); // Columns to select

  if (error) {
    console.error("❌ Erreur lors du chargement des annonces depuis Supabase :", error);
    return;
  }

  announcementsMap = new Map(data.map(item => [item.announcement_id, item.discord_message_id]));
  console.log(`📂 ${announcementsMap.size} annonces restaurées depuis Supabase`);
}

/**
 * Announcement channel feature: fetches announcements from Wolvesville API
 * and posts/updates them in the specified Discord channel.
 * @param {object} client - Discord client instance.
 * @param {string} salonID - Discord channel ID for announcements.
 * @param {string} clanId - Clan ID.
 * @param {object} axios - Axios instance for HTTP requests.
 * @param {object} headers - Headers for the API requests.
 * @return {Promise<void>}
 */
async function announcementChannel(client, salonID, clanId, axios, headers) {
  if (!salonID) return;
  try {
    const channel = await client.channels.fetch(salonID);
    if (!channel) return console.error("Salon introuvable.");

    // Fetch announcements from Wolvesville API
    const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/announcements`, { headers });
    const announcements = response.data;

    const currentIds = new Set(announcements.map(a => a.id));

    // Delete announcements that no longer exist
    for (const [annId, msgId] of announcementsMap) {
      if (!currentIds.has(annId)) {
        try {
          const msg = await channel.messages.fetch(msgId);
          await msg.delete();
        } catch (e) {
          console.log("Message Discord déjà supprimé ou introuvable :", e.message);
        }
        
        // Delete from Supabase
        const { error } = await supabase
          .from('announcements')
          .delete()
          .match({ announcement_id: annId });
          
        if (error) console.error("Erreur suppression DB:", error);
        
        announcementsMap.delete(annId);
      }
    }

    // Date formatting options
    const formattingOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZone: 'Europe/Paris'
    };

    // Process announcements in reverse order (oldest first)
    for (const announcement of announcements.reverse()) {
      const date = new Date(announcement.timestamp);
      const annId = announcement.id;
      // date.setHours(date.getHours() + 2); // Supprimé : le hardcodage n'est plus nécessaire
      
      // Utilise les options de formatage
      const timestamp = date.toLocaleString('fr-FR', formattingOptions);

      let content =
        `**__Annonce__**\n` +
        `**__Date__**: ${timestamp}\n` +
        `**__Contenu__**:\n${announcement.content}\n` +
        `**__Auteur__**: ${announcement.author}`;

      if (announcement.editTimestamp) {
        const editTime = new Date(announcement.editTimestamp);
        // editTime.setHours(editTime.getHours() + 2); // Supprimé
        
        // Utilise les mêmes options de formatage
        const editTimestamp = editTime.toLocaleString('fr-FR', formattingOptions);

        content += `\n*(Édité par ${announcement.editAuthor} le ${editTimestamp})*`;
      }

      // If announcement exists, update it; otherwise, create a new message
      if (announcementsMap.has(annId)) {
        const msgId = announcementsMap.get(annId);
        try {
          const msg = await channel.messages.fetch(msgId);
          const normalize = s => s.replace(/\r?\n/g, "\n").trim();
          if (normalize(msg.content) !== normalize(content)) {
            await msg.edit(content);
            console.log(`📝 Mise à jour de l'annonce ${annId}`);
          }
        } catch (e) {
          console.log("Impossible de mettre à jour :", e.message);
          // Message no longer exists, remove from DB and map
          await supabase.from('announcements').delete().match({ announcement_id: annId });
          announcementsMap.delete(annId);
        }
      } else {
        // New announcement, send message
        const sent = await channel.send(content);
        
        //Insert into Supabase
        const { error } = await supabase
          .from('announcements')
          .insert([
            { announcement_id: annId, discord_message_id: sent.id, clan_id: clanId }
          ]);

        if (error) {
          console.error("Erreur insertion DB:", error);
          // If DB insertion fails, delete the sent message to avoid inconsistency
          await sent.delete();
        } else {
          announcementsMap.set(annId, sent.id);
          console.log(`🆕 Nouvelle annonce publiée et sauvegardée (DB) : ${annId}`);
        }
      }
    }

  } catch (error) {
    console.error("Erreur lors de la requête :", error);
  }
}

module.exports = {
  announcementChannel,
  loadAnnouncementsFromDB
};