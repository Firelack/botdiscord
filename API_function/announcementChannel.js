// announcementChannel.js
const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, 'announcements.json');

// Download existing announcements from file
let announcementsMap = new Map();
if (fs.existsSync(dataFile)) {
  try {
    const savedData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    announcementsMap = new Map(Object.entries(savedData));
    console.log("📂 Annonces restaurées depuis le fichier JSON");
  } catch (err) {
    console.error("Erreur lors du chargement du fichier JSON :", err);
  }
}

// Save announcements to file
function saveAnnouncements() {
  const obj = Object.fromEntries(announcementsMap);
  fs.writeFileSync(dataFile, JSON.stringify(obj, null, 2), 'utf8');
}

async function announcementChannel(client, salonID, clanId, axios, headers) {
  if (!salonID) return;
  try {
    const channel = await client.channels.fetch(salonID);
    if (!channel) return console.error("Salon introuvable.");

    // Fetch announcements from Wolvesville API
    const response = await axios.get(`https://api.wolvesville.com/clans/${clanId}/announcements`, { headers });
    const announcements = response.data;

    const currentIds = new Set(announcements.map(a => a.id));

    // Delete old announcements that are no longer present
    for (const [annId, msgId] of announcementsMap) {
      if (!currentIds.has(annId)) {
        try {
          const msg = await channel.messages.fetch(msgId);
          await msg.delete();
        } catch (e) {
          console.log("Message déjà supprimé ou introuvable :", e.message);
        }
        announcementsMap.delete(annId);
        saveAnnouncements();
      }
    }

    // Process announcements in reverse order (oldest first)
    for (const announcement of announcements.reverse()) {
      const date = new Date(announcement.timestamp);
      const annId = announcement.id;
      date.setHours(date.getHours() + 2); // ✅ Update to UTC+2
      const timestamp = date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });

      let content =
        `**__Annonce__**\n` +
        `**__Date__**: ${timestamp}\n` +
        `**__Contenu__**:\n${announcement.content}\n` +
        `**__Auteur__**: ${announcement.author}`;

      if (announcement.editTimestamp) {
        const editTime = new Date(announcement.editTimestamp);
        editTime.setHours(editTime.getHours() + 2); // ✅ Décalage UTC+2
        const editTimestamp = editTime.toLocaleString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        });

        content += `\n*(Édité par ${announcement.editAuthor} le ${editTimestamp})*`;
      }

      // If announcement already exists, update it
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
          announcementsMap.delete(annId);
          saveAnnouncements();
        }
      } else {
        // New announcement, send it
        const sent = await channel.send(content);
        announcementsMap.set(annId, sent.id);
        saveAnnouncements();
        console.log(`🆕 Nouvelle annonce publiée : ${annId}`);
      }
    }

  } catch (error) {
    console.error("Erreur lors de la requête :", error);
  }
}

module.exports = announcementChannel;
