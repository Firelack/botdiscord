/**
 * Command to display information about leader commands.
 * !leadersCommands
 * @param {Object} message - The message object from Discord.
 * @return {void}
 */
async function leadersCommandsInfo(message) {
  if (message.content.toLowerCase().trim() === "!leaderscommands") {
    
    const msg1 = `## 👑 Commandes Chef/Adjoint 👑\n\n` +
      `Bienvenue ! Ce canal est dédié à la gestion du clan. Vous avez accès à des commandes spéciales.\n` +
      `Le bot envoie également des notifications quand une quête ou une étape de quête est terminée.\n\n` +
      
      `### 1. Gestion des Surnoms\n\n` +
      `   **Définir/Changer un surnom :** \`surnom:{joueur}:{nouveauSurnom}\`\n` +
      `   **Supprimer un surnom :** \`surnom:{joueur}:\` (laissez le champ du surnom vide)\n\n` +
      
      `> **Note :** Vous pouvez utilisez les surnoms pour les commandes de gestion des participations, des titres et des bonus et malus.\n` +
      `> Si aucun surnom n'est défini, vous pouvez utilisez une partie du pseudo du joueur ou le pseudo exact.\n` +
      `> En cas d'ambiguïté, le bot essaiera de résoudre le problème ou vous demandera de préciser.\n\n` +
      
      `### 2. Gestion des Participations aux Quêtes\n\n` +
      `   **Activer** 1 joueur : \`active:{joueur}\`\n` +
      `   **Désactiver** 1 joueur : \`desactive:{joueur}\`\n` +
      `   **Activer** multiple : \`active:{joueur1},{joueur2},...\`\n` +
      `   **Désactiver** multiple : \`desactive:{joueur1},{joueur2},...\`\n` +
      `   **Activer TOUS** : \`activeall:\`\n` +
      `   **Désactiver TOUS** : \`desactiveall:\``;
    
    await message.reply(msg1);

    const msg2 = `### 3. Changer le Titre (Flair) d'un Membre\n\n` +
      `   **Définir/Changer le titre :** \`titre:{joueur}:{nouveautitre}\`\n` +
      `   **Supprimer le titre :** \`titre:{joueur}\` (laissez le champ du titre vide)\n\n` +
      
      `### 4. Gestion des Annonces de Quêtes\n\n` +
      `   **Envoyer une annonce de quête maintenant :** \`annoncequest [dateLancement]:[numéro]\` (les deux arguments sont optionnels, la date par défaut est demain 20h00)\n` +
      `   **Activer/Désactiver l'annonce automatique du Lundi 20h00 :** \`togglequest\`\n` +
      `   **Activer/Désactiver les quêtes en gemmes :** \`togglegems\``;
    
    await message.channel.send(msg2);

    const msg3 = `### 5. Gestion des Bonus/Malus de Quêtes\n\n` +
      `   **Définir des bonus/malus :** \`setbonus Joueur1 X, Joueur2 Y\` \n` +
      `   **Ajouter des bonus/malus :** \`addbonus Joueur1 X, Joueur2 Y\` \n` +
      `   **Lister tous les bonus/malus :** \`statusquetes\`\n\n`+
      `   **Générer une annonce de bonus/malus :** \`bonusannonce\`\n\n` +
      `> **Note :** Si vous mettez un nombre négatif, cela correspond à un nombre de malus.\n` +
          
      `### 6. Autres Commandes\n\n` +
      `   **Aide :** \`!leadersCommands\` (Affiche ce message)\n\n` +
      
      `### 🌐 Redémarrage du Bot\n\n` +
      `   Si le bot est hors ligne, vous pouvez le relancer ici : [Hébergeur](https://botdiscord-6cwc.onrender.com/)`;

    await message.channel.send(msg3);
  }
}

module.exports = leadersCommandsInfo;