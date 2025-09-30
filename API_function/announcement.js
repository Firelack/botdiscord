function announcement(message, clanId, axios, headers) {
// Announcement of a clan
    if (message.content.toLowerCase().startsWith("annonce")) {
      axios.get(`https://api.wolvesville.com/clans/${clanId}/announcements`, {
        headers: headers
      })
        .then(response => {
          const announcements = response.data;

          if (announcements.length > 0) {
            // Reverse the announcements array and format each announcement
            announcements.reverse().forEach((announcement, index) => {
              const timestamp = new Date(announcement.timestamp).toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false
              });
              const content = announcement.content;
              const author = announcement.author;

              message.reply(`**__Annonce ${announcements.length - index}__**\n**__Date__**: ${timestamp}\n**__Contenu__**:\n${content}\n**__Auteur__**: ${author}`);
            });
          } else {
            message.reply("Aucune annonce disponible pour le moment.");
          }
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
}
module.exports = announcement;