# 🤖 Unofficial Wolvesville Bot

Un bot Discord développé pour améliorer l'expérience des joueurs sur **Wolvesville**. Il permet d'obtenir des informations détaillées sur les joueurs, les clans, les rôles, les rotations et plus encore, directement depuis Discord. Il permet également de lié un salon discord au message du jeu.

---

## ✨ Fonctionnalités principales

- 🔍 Obtenir les **profils**, **avatars**, **stats**, **cartes** et autres infos d’un joueur.
- 🛡️ Consulter les détails d’un **clan** : membres, nom, actualités.
- 🎭 Voir les descriptions et statistiques des **rôles** disponibles dans le jeu.
- 🛒 Accéder aux **offres du shop** et aux **challenges du battlepass**.
- 🎁 Commande spéciale pour récupérer un **chapeau API** si vous possédez un bot wov.
- 📧 Liaison entre un salon discord et le chat du clan.
- 🎉 Des easters eggs sont cachés dans certaines réponses du bot 😄
- 📰 Un salon discord pour activer et desactiver la participation des membres d'un clan

---

## 🧠 Commandes disponibles

Utilisez la commande `!helpme` dans Discord pour afficher la liste complète et mise à jour des commandes.

## 📌 Remarques

- Les noms de rôles sont en anglais avec des tirets `-` à la place des espaces.
- Les noms de joueurs et de clans doivent être **écrits exactement**, avec la bonne casse.

---

## 👨‍💻 Développeurs

Ce projet a été développer par :

- [Firelack](https://github.com/Firelack)
- [Alfakynz](https://github.com/Alfakynz)

Les contributions, idées ou retours sont les bienvenus !

## 📦 Installation

### ➕ Ajouter le bot à votre serveur

👉 [Lien d’invitation du bot](https://discord.com/oauth2/authorize?client_id=1165928098219433995&permissions=141312&integration_type=0&scope=bot)

### 🛠 Modifier le bot (ex. pour votre propre clan)

1. Créez un bot sur le [portail Discord Developer](https://discord.com/developers/applications)
2. Installez [Node.js](https://nodejs.org/)
3. Téléchargez les fichiers `bot.js`, `package.json`, `keep_alive.js` et le dossier `API_function`  \
4. Installez les dépendances :
   ```bash
   npm install
   ```
5. Créer un fichier .env et mettez :

   - APIKEY=votrecléapi
   - BOT_KEY=clédubot
   - CLAN_ID=idduclan
   - CHAT_CHANNEL_ID=iddiscord
   - QUEST_CHANNEL_ID=iddiscord2
   - PARTICIPATION_CHANNEL_ID=discord3

   La clé du bot est la clé de votre propre bot qu'il faut créer sur Discord Developper
   L'id discord est l'id du salon ou vous voulez que les messages de wov et de discord soient liés.
   L'id discord 2 est l'id du salon ou vous voulez être informés de l'anvancé des quêtes.
   L'id discord 3 est l'id du salon ou vous voulez pouvoir activer et desactiver la participation aux quêtes de chaques personnes.
Attention : Vous devez supprimer le sendMessage.js et toutes les allusions à sa fonction dans index.js et bot.js (ainsi que les MESSAGE_CHANNEL_ID et PERSON_MENTION_ID) de même pensez à supprimer le MESSAGE_CHANNEL_ID de easterEggs.js

6. Lancer le bot avec `node bot.js`
7. Pour l'id d'un clan :\
    Faire idclan{nom_du_clan} \
   ⚠️ Vous devez ajouter votre API à la liste des bots d'un clan pour avoir les informations du clan
8. Conseil : modifier les réponses du bot dans `API_function/easterEggs.js` avec ce que vous voulez ! \
Si vous ne comptez pas heberger le bot, l'avant dernière ligne n'est pas utile. \
Si vous ne voulez pas du chat lié, et de la fonction qui donne l'avancée des quêtes, et de celle pour changer les participations,  supprimez les lignes 98, 96, 69-73, 39-51, 18-20.
