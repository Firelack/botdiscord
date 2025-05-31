function botInfo(message) {
  if (message.content.toLowerCase() === "!botinfo") {
    message.reply(
      `Ce bot Discord a été développé par [Firelack](https://github.com/Firelack) et [Alfakynz](https://github.com/Alfakynz) (Valtintin) pour le clan Werewolf Online*. 

Si vous avez des suggestions, n'hésitez pas à nous en faire part.

\`!helpme\` pour avoir les commandes disponibles.

Il permet de récupérer des informations du jeu et de faire quelque chose d'indisponible en jeu : récupérer un **code pour copier un avatar** !

🔗 **Lien du code GitHub :** [https://github.com/Firelack/botdiscord](https://github.com/Firelack/botdiscord)  
🤖 **Inviter le bot sur votre serveur :** [Lien d'invitation](https://discord.com/oauth2/authorize?client_id=1165928098219433995&permissions=141312&integration_type=0&scope=bot)`
    );
  }
}

module.exports = botInfo;
