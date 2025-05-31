    function clanMembers(message, axios, headers) {
    // Membres d'un clan
    if (message.content.toLowerCase().startsWith("membersclan:")) {
      const clanName = message.content.substring(12).trim();

      axios.get(`https://api.wolvesville.com/clans/search?name=${clanName}`, {
        headers: headers
      })
        .then(response => {
          const clanId = response.data[0].id; // Assurez-vous que le champ clanId est correctement défini dans la réponse de la première requête
          const batchSize = 10; // Nombre de membres par lot
          const totalMembers = response.data[0].memberCount; // Nombre total de membres dans le clan
          const numBatches = Math.ceil(totalMembers / batchSize);

          // Effectuez une requête par lot
          const batchRequests = Array.from({ length: numBatches }, (_, batchIndex) => {
            const offset = batchIndex * batchSize;
            return axios.get(`https://api.wolvesville.com/clans/${clanId}/members?limit=${batchSize}&offset=${offset}`, {
              headers: headers
            });
          });

          // Attendez toutes les requêtes en parallèle
          return Promise.all(batchRequests);
        })
        .then(batchResponses => {
          // Utilisez un ensemble pour suivre les membres déjà inclus
          const includedMembers = new Set();

          // Traitez les données des membres comme nécessaire
          const memberInfoArray = batchResponses.flatMap(batchResponse => {
            return batchResponse.data.map(member => {
              // Vérifiez si le membre a déjà été inclus
              if (!includedMembers.has(member.username)) {
                // Ajoutez le membre à l'ensemble pour éviter les duplications
                includedMembers.add(member.username);

                return {
                  "Username": member.username,
                  "XP": member.xp,
                };
              } else {
                return null; // Membre déjà inclus, renvoyer null pour l'ignorer
              }
            });
          });

          // Filtrez les membres nuls (déjà inclus) avant d'envoyer les messages
          const filteredMembers = memberInfoArray.filter(member => member !== null);

          // Envoyez les messages par lots de 10 membres
          for (let i = 0; i < filteredMembers.length; i += 10) {
            const currentBatch = filteredMembers.slice(i, i + 10);
            const formattedBatch = currentBatch.map(member => {
              return `- **__Username__**: ${member.Username} **__XP__**: ${member.XP}`;
            }).join('\n');
            message.reply(`Liste des membres du clan:\n${formattedBatch}`);
          }
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
}
module.exports = clanMembers;