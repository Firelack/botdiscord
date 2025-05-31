function easterEggs(message) {
// Si quelqu'un tag le bot xD
    if (message.content.includes(`<@1165928098219433995>`) || message.mentions.users.has('1165928098219433995')) {
      message.reply("Pourquoi tu me tag, achète-toi une vie");
    }

    // Plein de truc fun
    if (message.content.toLowerCase().includes("mdrrrrrrrrrrr") || message.content.toLowerCase().includes("ptdrrrrrrrrrrr")) {
      message.reply("Peut être c'est excessif (chaud t'es tombé(e) pile sur le bon nombre de r)");
    }
    if (message.content.toLowerCase().includes("i love you") || message.content.toLowerCase().includes("i love u")) {
      message.reply("Me too 💘");
    }
    if (message.content.toLowerCase().includes("je t'aime") || message.content.toLowerCase().includes("je t aime")) {
      message.reply("Moi aussi 💘");
    }
    if (message.content.toLowerCase().includes(" ah ") || message.content.toLowerCase().startsWith("ah ") || message.content.toLowerCase().endsWith(" ah") || message.content.toLowerCase() === "ah") {
      message.reply("BH (je suis trop drôle rigole 🔫)");
    }
    if (message.content.toLowerCase().includes(";-;")) {
      message.reply("SOURIS UN PEU !");
    }
    if (message.content.toLowerCase().includes("mouton") || message.content.toLowerCase().includes("🐑") || message.content.toLowerCase().includes("sheep")) {
      message.reply("Si il est sur une roue faites le cramer");
    }
    if (message.content.toLowerCase().includes("!test")) {
      message.reply("Je suis sûr t'as raté");
    }
    if (message.content.toLowerCase().includes("prison")) {
      message.reply("L'endroit préféré de Valtintin");
    }
    if (message.content.toLowerCase().includes("staline")) {
      message.reply("Notre cheffe");
    }
    if (message.content.toLowerCase().includes("révolution")) {
      message.reply("REVOLUTION !");
    }
    if (message.content.toLowerCase().includes("menotte")) {
      message.reply("Surtout avec de la fourrure 👀");
    }
    if (message.content.toLowerCase().includes("firelack")) {
      message.reply("La super dev de ce bot !");
    }
    if (message.content.toLowerCase().includes("mathematics") || message.content.toLowerCase().includes("maths")) {
      message.reply("J'adore les maths, surtout quand c'est pour faire des calculs de probabilité pour le jeu !");
    }
    if (message.content.toLowerCase().includes("herbe")) {
      message.reply("C'est quoi ?");
    }
    if (message.content.toLowerCase().includes("informatique")) {
      message.reply("J'en dors plus...");
    }
}
module.exports = easterEggs;