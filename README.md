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
- 📰 A Discord channel for leader's to enable or disable clan members’ participation, to change flairs, and to see if quest or if the quest stage is finished (!leadersCommands).
- 🤖 Automatic announcement and bonuses/maluses for developpers' clan.
- Additional useful features for developers’ clan.  

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
3. Fork this repository
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
   MESSAGE_TO_KEEP_ID="messageToKeepId"
   SUPABASE_URL="supabaseurl"
   SUPABASE_KEY="supabasekey"
   ```

   - The bot key is your own bot’s token, which you must create on the [Discord Developer Portal](https://discord.com/developers/applications).  
   - `chatdiscordid` is the channel ID where Wolvesville ↔ Discord messages will be linked.  
   - `leaderchannelid` is the channel ID for leaders to know if quest is active, to edit flairs, or change participation of members and leaders.  
   - `announcementChannel` is the channel ID where announcement can be post.  
   - `messageToKeepId` is the first message of the sync channel to go up easly.
   - `superbaseurl` and `superbasekey` are credentials to access the Supabase database. These are not used yet; details about the database will be provided later.

   ⚠️ Important: You must delete the `commands/members/easterEggs.js` or replace easter eggs for your clan.  

6. Run the bot:  

   ```bash
   node src/bot.js
   ```

7. To get a clan ID:\
   Use in discord :

   ```bash
   idclan:{clan_name}
   ```

   ⚠️ You must add your API to a clan’s bot list to access clan information.
8. Tip: edit the bot’s responses in `commands/members/easterEggs.js` to customize them!

### 🚨 Additional Notes

- If you don’t plan to host the bot, remove keepAlive(); from bot.js.

- Many features might not be useful to you — if so, delete their related code in bot.js.

## 🧩 To-Do List — WOV Discord Bot

### ⚙️ Automatic clan system

- [ ] Post a new **Free Quest Announcement** message to reflect these changes. (Update and delete cannot be done with the API, need to delete old annoucement manual)  
- [ ] Implement logic for handling quest launches:
  - [ ] If the quest reason contains “**free quest**” or “raison”, **decrement** and mark it as launched.  
  - [ ] If the contribution is exactly **400**, include it in the quest.  
  - [ ] If the **total contribution** is 400, include it in the quest.  
  - [ ] If the total is **greater than 400** or spread across multiple entries, trigger a **warning** (check if “quest” is included).  
  - [ ] Automatically **activate participation** for all members and launch at the scheduled announcement time.  
  - [ ] Add a command to **enable or disable default Sub-Chief/Chief participations**.  
