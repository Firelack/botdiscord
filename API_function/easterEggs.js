function easterEggs(message) {
// Si quelqu'un tag le bot xD
    if (message.content.includes(`<@1165928098219433995>`) || message.mentions.users.has('1165928098219433995')) {
      message.reply("Pourquoi tu me tag, achète-toi une vie");
    }

    // Plein de truc fun
    if (message.content.toLowerCase().includes("i love you") || message.content.toLowerCase().includes("i love u")) {
      message.reply("Me too 💘");
    } else if (message.content.toLowerCase().includes("je t'aime") || message.content.toLowerCase().includes("je t aime")) {
      message.reply("Moi aussi 💘");
    }
    if (message.content.toLowerCase().includes("mdrrrrrrrrrrr") || message.content.toLowerCase().includes("ptdrrrrrrrrrrr")) {
      message.reply("Peut être c'est excessif (chaud t'es tombé(e) pile sur le bon nombre de r)");
    } //else if (message.content.toLowerCase().includes(" ah ") || message.content.toLowerCase().startsWith("ah ") || message.content.toLowerCase().endsWith(" ah") || message.content.toLowerCase() === "ah") {
      //message.reply("BH (je suis trop drôle rigole 🔫)");
    //} 
    else if (message.content.toLowerCase().includes(";-;")) {
      message.reply("SOURIS UN PEU !");
    } else if (message.content.toLowerCase().includes("mouton") || message.content.toLowerCase().includes("🐑") || message.content.toLowerCase().includes("sheep")) {
      message.reply("Si il est sur une roue faites le cramer");
    } else if (message.content.toLowerCase().includes("prison")) {
      message.reply("L'endroit préféré de Valtintin");
    } else if (message.content.toLowerCase().includes("staline")) {
      message.reply("Notre cheffe");
    } else if (message.content.toLowerCase().includes("révolution")) {
      message.reply("REVOLUTION !");
    } else if (message.content.toLowerCase().includes("révolutionnaire")) {
      message.reply("C'est platy le révolutionnaire !");
    } else if (message.content.toLowerCase().includes("menotte")) {
      message.reply("Surtout avec de la fourrure 👀");
    } else if (message.content.toLowerCase().includes("patate")) {
      message.reply("Les patates à la farine de platy");
    } else if (message.content.toLowerCase().includes("mathematiques") || message.content.toLowerCase().includes("maths")) {
      message.reply("J'adore les maths, surtout quand c'est pour faire des calculs de probabilité pour le jeu !");
    } else if (message.content.toLowerCase().includes("herbe")) {
      message.reply("C'est quoi ?");
    } else if (message.content.toLowerCase().includes("informatique")) {
      message.reply("J'en dors plus...");
    }
    if (message.content.toLowerCase().includes("!test")) {
      message.reply("Je suis sûr t'as raté");
    }
  const randomChance = Math.floor(Math.random() * 4); // Valeur entre 0 et 3
  if (randomChance === 0) {
    if (message.content.toLowerCase().includes("firelack") && (message.content.toLowerCase().includes("valtintin") || message.content.toLowerCase().includes("alfakynz"))) {
      message.reply("Les deux super devs de ce bot !");
    } else if (message.content.toLowerCase().includes("firelack"))  {
      message.reply("JE SUIS PAS GEEK");
    } else if (message.content.toLowerCase().includes("valtintin") || message.content.toLowerCase().includes("alfakynz")) {
      message.reply("C'EST LUI LE GEEK");
    } else if (message.content.toLowerCase().includes("lalouve") || message.content.toLowerCase().includes("louve")) {
      message.reply("Je sais pas by platypus");
    } else if (message.content.toLowerCase().includes("platypus")) {
      message.reply("Le révolutionnaire");
    } else if (message.content.toLowerCase().includes("soline")) {
      message.reply("Elle peut pas répondre elle dors.");
    } else if (message.content.toLowerCase().includes("lost") || message.content.toLowerCase().includes("lostinred")) {
      message.reply("Aboule le FRIC 🔫");
    }
  }
}
module.exports = easterEggs;