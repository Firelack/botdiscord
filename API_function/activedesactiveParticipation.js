function activedesactiveParticipations(message, clanId, salonId, axios, headers) { 
  // Tout les avatars ou un avatars en particulier d'un joueur
  if (message.content.toLowerCase().startsWith("active:") && message.channel.id == salonId) {
    const profilName = message.content.substring(7).trim();

      axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;
          const userId = responseData.id;

        axios.put(`https://api.wolvesville.com/clans/${clanId}/members/${userId}/participateInQuests`, {
          "participateInQuests": true },
          { headers: headers })
          .then(() => {
            message.reply(`La participation de ${profilName} a été activée avec succès !`);
          })
            .catch(error => {
              message.reply("Une erreur s'est produite lors de l'activation de la participation.");
              console.error(error);
            }  );
    });
  } else if (message.content.toLowerCase().startsWith("desactive:") && message.channel.id == salonId) {
    const profilName = message.content.substring(10).trim();

    axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
      headers: headers
    })
      .then(response => {
        const responseData = response.data;
        const userId = responseData.id;

        axios.put(`https://api.wolvesville.com/clans/${clanId}/members/${userId}/participateInQuests`, {
          "participateInQuests": false },
          { headers: headers })
          .then(() => {
            message.reply(`La participation de ${profilName} a été désactivée avec succès !`);
          })
          .catch(error => {
            message.reply("Une erreur s'est produite lors de la désactivation de la participation.");
            console.error(error);
          });
      });
  }
}
module.exports = activedesactiveParticipations;
