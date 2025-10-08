function activedesactiveParticipations(message, clanId, salonId, axios, headers) {
  // Active one player
  if (message.content.toLowerCase().startsWith("active:") && message.channel.id == salonId) {
    const profilName = message.content.substring(7).trim();

    axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, { headers })
      .then(response => {
        const userId = response.data.id;

        axios.put(
          `https://api.wolvesville.com/clans/${clanId}/members/${userId}/participateInQuests`,
          { participateInQuests: true },
          { headers }
        )
        .then(() => {
          message.reply(`✅ La participation de ${profilName} a été activée avec succès !`);
        })
        .catch(error => {
          message.reply("❌ Une erreur s'est produite lors de l'activation de la participation.");
          console.error(error);
        });
      });

  // Desactive one player
  } else if (message.content.toLowerCase().startsWith("desactive:") && message.channel.id == salonId && !message.content.toLowerCase().includes("all")) {
    const profilName = message.content.substring(10).trim();

    axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, { headers })
      .then(response => {
        const userId = response.data.id;

        axios.put(
          `https://api.wolvesville.com/clans/${clanId}/members/${userId}/participateInQuests`,
          { participateInQuests: false },
          { headers }
        )
        .then(() => {
          message.reply(`✅ La participation de ${profilName} a été désactivée avec succès !`);
        })
        .catch(error => {
          message.reply("❌ Une erreur s'est produite lors de la désactivation de la participation.");
          console.error(error);
        });
      });

  // Desactive all players
  } else if (message.content.toLowerCase() === "desactiveall:" && message.channel.id == salonId) {
    message.reply("🔄 Désactivation de tous les membres en cours...");

    axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers })
      .then(response => {
        const members = response.data;
        const promises = [];

        for (const member of members) {
          // If the member is currently participating, create a promise to disable participation
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
    // Active all players
  } else if (message.content.toLowerCase() === "activeall:" && message.channel.id == salonId) {
    message.reply("🔄 Activation de tous les membres en cours...");

    axios.get(`https://api.wolvesville.com/clans/${clanId}/members`, { headers })
      .then(response => {
        const members = response.data;
        const promises = [];

        for (const member of members) {
          // If the member is currently participating, create a promise to disable participation
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

module.exports = activedesactiveParticipations;
