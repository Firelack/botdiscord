/**
 * Sends a list of available commands when the help command is triggered.
 * @param {Object} message - The message object from Discord.
 * @returns {void}
 */
function commandList(message) {
  if (message.content.toLowerCase() === "!helpme") {
    message.reply(
      `# Commandes disponibles :

**__Informations d'un joueur:__**
- Profil:{nom du joueur}
- Actualavatar:{nom du joueur}
- Avatar:{nom du joueur}
- Avatar:{nom du joueur} {slot}
- Cartes:{nom du joueur}
- Stats:{nom du joueur}

**__Infomations sur un clan:__**
- Clan:{nom du clan}
- Membersclan:{nom du clan}

**__Informations sur un rôle:__**
- Role:{nom du role}
- Advanced:{nom du role}

**__Avatars code:__**
- Idavatar:{id de l'avatar}
- Searchid:{nom du joueur} {numéro de slot}

**__Informations du clan WerewoIf OnIine*:__**
- Actualquest
- Quest
- Annonce
- mybonus (Pour voir ton statut de quêtes gratuites/malus)

**__Offres actives du shop:__**
- Offres

**__Challenges actif du battlepass:__**
- Battlepass

**__Rôles en jeu:__** (rapide, sérieuse, sandbox, silver et gold)
- Rolerotations:{mode de jeu}

**__Spécial:__** Si vous possédez un bot sur wov et que vous voulez le chapeau de l'API (veuillez réinitialiser votre clé API après cette commande pour plus de sécurité)
- Apichapeau:{votre clé api}

**__PS:__** Les noms des rôles sont en anglais et avec - à la place des espaces, les pseudos ou noms de clan sont à écrire correctement

|| **__PS bis:__** Il y a des réponses du bot lorsque vous dites certaines choses, à vous de découvrir les easters eggs ||

Ce bot Discord a été développé par Firelack et Alfakynz (Valtintin) pour plus d'info : !botinfo`
    );
  }
}

module.exports = commandList;