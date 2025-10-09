# 🤖 Unofficial Wolvesville Bot

A Discord bot developed to enhance the **Wolvesville** player experience.  
It provides detailed information about players, clans, roles, rotations, and more — directly from Discord.  
It can also link a Discord channel to your in-game clan chat. \
A lot of features are made for the developpers clan "WerewoIf OnIine*" but you can change for your own clan if necessary !

---

## ✨ Main Features

- 🔍 Get **profiles**, **avatars**, **stats**, **cards**, and other player info.  
- 🛡️ View **clan details**: members, name, news.  
- 🎭 See the descriptions and stats of available **roles** in the game.  
- 🛒 Access **shop offers** and **battle pass challenges**.  
- 🎁 Special command to get an **API hat** if you own a Wolvesville bot.  
- 📧 Link between a Discord channel and clan chat.
- 🆕 An announcement channel link to announcements in game.
- 🎉 Easter eggs are hidden in some bot responses 😄  
- 📰 A Discord channel to enable or disable clan members’ participation.  
- Additional useful features for developers’ clans.  

---

## 🧠 Available Commands

Use the `!helpme` command in Discord to display the full and up-to-date list of commands.

---

## 📌 Notes

- Role names are in English with hyphens `-` instead of spaces.  
- Player and clan names must be written **exactly**, with correct casing.  

---

## 👨‍💻 Developers

This project was developed by:  

- [Firelack](https://github.com/Firelack)  
- [Alfakynz](https://github.com/Alfakynz)  

Contributions, ideas, or feedback are welcome!  

---

## 📦 Installation

### ➕ Add the bot to your server

👉 [Bot invitation link](https://discord.com/oauth2/authorize?client_id=1165928098219433995&permissions=141312&integration_type=0&scope=bot)  

---

### 🛠 Modify the bot (e.g. for your own clan)

1. Create a bot on the [Discord Developer Portal](https://discord.com/developers/applications)  
2. Install [Node.js](https://nodejs.org/)  
3. Download the files `bot.js`, `package.json`, `keep_alive.js` and the `API_function` folder  
4. Install dependencies:

   ```bash
   npm install
   ```

5. Create a `.env` file and add:

   ```bash
   APIKEY="yourapikey"
   BOT_KEY="yourbotkey"
   CLAN_ID="clanid"
   CHAT_CHANNEL_ID="chatdiscordid"
   LEADER_CHANNEL_ID="leaderchannelid"
   ANNOUNCEMENT_CHANNEL_ID="announcementChannel"
   ```

   - The bot key is your own bot’s token, which you must create on the [Discord Developer Portal](https://discord.com/developers/applications).  
   - `chatdiscordid` is the channel ID where Wolvesville ↔ Discord messages will be linked.  
   - `leaderchannelid` is the channel ID for leaders to know if quest is active, to edit flairs, or change participation of members and leaders.  
   - `announcementChannel` is the channel ID where announcement can be post.  

   ⚠️ Important: You must delete the `sendMessage.js` file and remove all references to its function in `index.js`, `bot.js`, and `easterEggs.js`.  

6. Run the bot:  

   ```bash
   node bot.js
   ```

7. To get a clan ID:\
   Use in discord :

   ```bash
   idclan{clan_name}
   ```

   ⚠️ You must add your API to a clan’s bot list to access clan information.
8. Tip: edit the bot’s responses in `API_function/easterEggs.js` to customize them!

### 🚨 Additional Notes

- If you don’t plan to host the bot, remove keepAlive(); from bot.js.

- Many features might not be useful to you — if so, delete their related code in bot.js.
