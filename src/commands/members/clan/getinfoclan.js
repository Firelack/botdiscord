function getClanInfo(message, axios, headers) {
// Fetch clan information
    if (message.content.toLowerCase().startsWith("clan:")) {
      const clanName = message.content.substring(5).trim();

      axios.get(`https://api.wolvesville.com/clans/search?name=${clanName}`, {
        headers: headers
      })
        .then(response => {
          const responseData = response.data[0];
          const selectedInfo = {
            "creationTime": responseData.creationTime,
            "name": responseData.name,
            "description": responseData.description,
            "xp": responseData.xp,
            "language": responseData.language,
            "icon": responseData.icon,
            "iconColor": responseData.iconColor,
            "tag": responseData.tag,
            "joinType": responseData.joinType,
            "questHistoryCount": responseData.questHistoryCount,
            "minLevel": responseData.minLevel,
            "memberCount": responseData.memberCount,
          };

          message.reply(`# Name: ${selectedInfo.name}\n**__Date de Création:__** ${selectedInfo.creationTime}\n**__Description:__** \n\n${selectedInfo.description}\n\n**__Xp:__** ${selectedInfo.xp}\n**__Langage:__** ${selectedInfo.language}\n**__Tag:__** ${selectedInfo.tag}\n**__Rejoindre type:__** ${selectedInfo.joinType}\n**__Nombre de quête:__** ${selectedInfo.questHistoryCount}\n**__Level minimum:__** ${selectedInfo.minLevel}\n**__Nombre de membres:__** ${selectedInfo.memberCount}`);
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
}
module.exports = getClanInfo;