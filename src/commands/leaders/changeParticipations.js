const searchMember = require('../../utils/searchMember.js'); // ADDED

function changeParticipations(message, clanId, salonId, axios, headers) {
  // === ACTIVE ONE OR MULTIPLE PLAYERS ===
  if (message.content.toLowerCase().startsWith("active:") && message.channel.id == salonId && !message.content.toLowerCase().includes("all")) {
    const rawNames = message.content.substring(7).trim();
    const profilNames = rawNames.split(",").map(n => n.trim()).filter(n => n.length > 0);

    if (profilNames.length === 0) {
      return message.reply("⚠️ Aucun nom de profil spécifié après `active:`.");
    }

    message.reply(`🔄 Activation de ${profilNames.length} joueur(s) en cours...`);

    const promises = profilNames.map(profilName =>
      searchMember(profilName, clanId, axios, headers) // REPLACED search
        .then(result => {
          if (result.error) {
            return result.error;
          }
          const { userId, username } = result;
          return axios.put(
            `https://api.wolvesville.com/clans/${clanId}/members/${userId}/participateInQuests`,
            { participateInQuests: true },
            { headers }
          )
          .then(() => `✅ ${username} activé`)
          .catch(() => `❌ Erreur lors de l'activation de ${username}`);
        })
    );

    Promise.all(promises).then(results => {
      message.reply(results.join("\n"));
    });

  // === DESACTIVE ONE OR MULTIPLE PLAYERS ===
  } else if (message.content.toLowerCase().startsWith("desactive:") && message.channel.id == salonId && !message.content.toLowerCase().includes("all")) {
    const rawNames = message.content.substring(10).trim();
    const profilNames = rawNames.split(",").map(n => n.trim()).filter(n => n.length > 0);

    if (profilNames.length === 0) {
      return message.reply("⚠️ Aucun nom de profil spécifié après `desactive:`.");
    }

    message.reply(`🔄 Désactivation de ${profilNames.length} joueur(s) en cours...`);

    const promises = profilNames.map(profilName =>
      searchMember(profilName, clanId, axios, headers) // REPLACED search
        .then(result => {
          if (result.error) {
            return result.error;
          }
          const { userId, username } = result;
          return axios.put(
            `https://api.wolvesville.com/clans/${clanId}/members/${userId}/participateInQuests`,
            { participateInQuests: false },
            { headers }
          )
          .then(() => `✅ ${username} désactivé`)
          .catch(() => `❌ Erreur lors de la désactivation de ${username}`);
        })
    );

    Promise.all(promises).then(results => {
      message.reply(results.join("\n"));
    });

  // === DESACTIVE ALL ===
  } else if (message.content.toLowerCase() === "desactiveall:" && message.channel.id == salonId) {
    message.reply("🔄 Désactivation de tous les membres en cours...");

    axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers })
      .then(response => {
        const members = response.data;
        const promises = [];

        for (const member of members) {
          if (member.participateInClanQuests) {
            const p = axios.put(
              `https://api.wolvesville.com/clans/${clanId}/members/${member.playerId}/participateInQuests`,
              { participateInQuests: false },
              { headers }
            ).catch(err => console.error(`Erreur avec ${member.username}:`, err.response?.data || err.message));
            promises.push(p);
          }
        }

        Promise.all(promises)
          .then(() => {
            message.reply(`✅ Tous les membres (${promises.length}) ont été désactivés avec succès !`);
          })
          .catch(error => {
            message.reply("❌ Une erreur s'est produite lors de la désactivation collective.");
            console.error(error);
          });
      })
      .catch(error => {
        message.reply("❌ Impossible de récupérer la liste des membres du clan.");
        console.error(error);
      });

  // === ACTIVE ALL ===
  } else if (message.content.toLowerCase() === "activeall:" && message.channel.id == salonId) {
    message.reply("🔄 Activation de tous les membres en cours...");

    axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers })
      .then(response => {
        const members = response.data;
        const promises = [];

        for (const member of members) {
          if (!member.participateInClanQuests) {
            const p = axios.put(
              `https://api.wolvesville.com/clans/${clanId}/members/${member.playerId}/participateInQuests`,
              { participateInQuests: true },
              { headers }
            ).catch(err => console.error(`Erreur avec ${member.username}:`, err.response?.data || err.message));
            promises.push(p);
          }
        }

        Promise.all(promises)
          .then(() => {
            message.reply(`✅ Tous les membres (${promises.length}) ont été activés avec succès !`);
          })
          .catch(error => {
            message.reply("❌ Une erreur s'est produite lors de l'activation collective.");
            console.error(error);
          });
      })
      .catch(error => {
        message.reply("❌ Impossible de récupérer la liste des membres du clan.");
        console.error(error);
      });
  }
}

module.exports = changeParticipations;