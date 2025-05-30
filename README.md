# 🤖 Bot Wolvesville

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

⚠️ Ce bot n'effectue que des actions qui donnent des informations ou envoie des messages.

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

👉 [Lien d’invitation du bot](https://discord.com/oauth2/authorize?client_id=1165928098219433995)

### 🛠 Modifier le bot (ex. pour votre propre clan)

1. Créez un bot sur le [portail Discord Developer](https://discord.com/developers/applications)
2. Installez [Node.js](https://nodejs.org/)
3. Téléchargez les fichiers `bot.js`, `package.json` et `keep_alive.js`  \
(`keep_alive.js` est utile si vous comptez héberger le bot, si vous n'en voulez pas, supprimez les lignes 819 puis 4 de `bot.js`)  
4. Installez les dépendances :
   ```bash
   npm install
   ```
5. Créer un fichier .env et mettez :

   - APIKEY=votrecléapi
   - BOT_KEY=clédubot
   - CLAN_ID=idduclan
   - SALON_ID=iddiscord

   La clé du bot est la clé de votre propre bot qu'il faut créer sur Discord Developper
   L'id discord est l'id du salon ou vous voulez que les messages soient liés.

6. Lancer le bot avec `node bot.js`
7. Pour l'id d'un clan :\
    Faire idclan{nom_du_clan} \
   ⚠️ Vous devez ajouter votre API à la liste des bots d'un clan pour avoir les informations du clan
