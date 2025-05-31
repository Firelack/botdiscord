function playerProfil(message, axios, headers) {
// Récupérer un profil de joueur
    if (message.content.toLowerCase().startsWith("profil:")) {
      const profilName = message.content.substring(7).trim();

      axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data;
          const selectedInfo = {
            "id": responseData.id,
            "username": responseData.username,
            "personalMessage": responseData.personalMessage,
            "level": responseData.level,
            "status": responseData.status,
            "creationTime": responseData.creationTime,
            "lastOnline": responseData.lastOnline,
            "rankedSeasonSkill": responseData.rankedSeasonSkill,
            "rankedSeasonMaxSkill": responseData.rankedSeasonMaxSkill,
            "rankedSeasonBestRank": responseData.rankedSeasonBestRank,
            "rankedSeasonPlayedCount": responseData.rankedSeasonPlayedCount,
            "receivedRosesCount": responseData.receivedRosesCount,
            "sentRosesCount": responseData.sentRosesCount,
            "profileIconId": responseData.profileIconId,
            "profileIconColor": responseData.profileIconColor,
            "equippedAvatar": responseData.equippedAvatar.url
          };
          const nouvelleExtension = "@3x.png";
          const avatarUrl = selectedInfo.equippedAvatar.replace(".png", nouvelleExtension);

          message.reply(`# Profil de  ${selectedInfo.username}\n**__Level:__** ${selectedInfo.level}\n**__Description:__** \n\n${selectedInfo.personalMessage}\n\n**__Status:__** ${selectedInfo.status}\n**__Last Online:__** ${selectedInfo.lastOnline}\n**__Création du compte:__** ${selectedInfo.creationTime}\n**__Roses reçus:__** ${selectedInfo.receivedRosesCount}\n**__Roses envoyées:__** ${selectedInfo.sentRosesCount}\n**__Avatar équipé:__** [Avatar](${avatarUrl})`);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
  }
module.exports = playerProfil;