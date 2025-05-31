function searchAvatarId(message, axios, headers) {
//recuperer id correspondant a un  avatar 
    if (message.content.toLowerCase().startsWith("searchid:")) {
      // Extraire le nom du joueur et le numéro de slot
      const contentArray = message.content.substring(9).trim().split(" ");

      // Assurer qu'il y a au moins un élément après "searchid:"
      if (contentArray.length > 0) {
        const profilName = contentArray[0];

        // Vérifier si un numéro de slot est fourni
        const slotNumber = contentArray.length > 1 ? contentArray[1] : null;

        // Déclarer resp en dehors de la portée de la deuxième requête Axios
        let avatarUrl;
        let resp;

        axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
          headers: headers
        })
          .then(response => {
            const responseData = response.data;
            const selectedInfo = {
              "id": responseData.id,
              "username": responseData.username,
              "avatar": responseData.avatars[slotNumber-1].url
            };
            const nouvelleExtension = "@3x.png";
            avatarUrl = selectedInfo.avatar.replace(".png", nouvelleExtension);

            // Retourner la promesse de la deuxième requête Axios
            return axios.get(`https://api.wolvesville.com/avatars/sharedAvatarId/${responseData.id}/${slotNumber-1}`, {
              headers: headers
            });
          })
          .then(response => {
            resp = response.data;
            // Répondre ici après que les deux requêtes aient réussi
            message.reply(`**__Avatar demandé:__** [Avatar](${avatarUrl})\n**__Avatar id:__** ${resp}`);
          })
          .catch(error => {
            message.reply("Une erreur s'est produite lors de la requête, vérifier les informations fournies.");
            console.error(error);
          });
      } else {
        // Gérer le cas où aucun nom de joueur n'est fourni
        console.log("Aucun nom de joueur fourni après 'searchid:'");
      }
    }
}
module.exports = searchAvatarId;