function leadersCommandsInfo(message) {
  if (message.content.toLowerCase().trim() === "!leaderscommands") {
    message.reply(
      `## 👑 Commandes Chef/Adjoint 👑\n\n` +
      `Bienvenue ! Ce canal est dédié à la gestion du clan. Vous avez accès à des commandes spéciales.
      Le bot envoie également des notifications quand une quête ou une étape de quête est terminée.
      
      ### 1. Gestion des Participations aux Quêtes
      
      **Activer** 1 joueur : \`active:{joueur}\`
      **Désactiver** 1 joueur : \`desactive:{joueur}\`
      **Activer** multiple : \`active:{joueur1},{joueur2},...\`
      **Désactiver** multiple : \`desactive:{joueur1},{joueur2},...\`
      **Activer TOUS** : \`activeall:\`
      **Désactiver TOUS** : \`desactiveall:\`
      
      > **Note :** Utilisez un surnom (une partie du pseudo) ou le pseudo exact. En cas d'ambiguïté, le bot essaiera de résoudre ou vous demandera de préciser.
      
      ### 2. Changer le Titre (Flair) d'un Membre
      
      **Définir/Changer le titre :** \`titre:{joueur}:{nouveautitre}\`
      **Supprimer le titre :** \`titre:{joueur}\` (laissez le champ du titre vide)

      ### 3. Gestion des Annonces de Quêtes
      
      **Envoyer une annonce de quête maintenant :** \`announcequest {dateLancement}:{numéro}\` (les deux arguments sont optionnels, la date par défaut est demain 20h00)
      **Activer/Désactiver l'annonce automatique du Lundi 20h00 :** \`togglequest:\`
      **Activer/Désactiver les quêtes en gemmes :** \`tooglegems:\`
          
      ### 4. Autres Commandes
      
      **Aide :** \`!leadersCommands\` (Affiche ce message)
      
      ### 🌐 Redémarrage du Bot
      
      Si le bot est hors ligne, vous pouvez le relancer ici : [Hébergeur](https://botdiscord-6cwc.onrender.com/) `
    );
  }
}

module.exports = leadersCommandsInfo;