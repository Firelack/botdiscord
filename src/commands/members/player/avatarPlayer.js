const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const sharp = require('sharp');

/**
 * Downloads an image from a given URL.
 * @param {string} url - The URL of the image to download.
 * @param {Object} axiosInstance - The axios instance for making HTTP requests.
 * @returns {Promise<Buffer|null>} - A promise that resolves to the image buffer or null if an error occurs.
 */
async function downloadImage(url, axiosInstance) { 
  try {
    const response = await axiosInstance.get(url, {
      responseType: 'arraybuffer'
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur_téléchargEMENT ${url}:`, error.message); 
    return null;
  }
}

async function avatarPlayer(message, axios, headers) {

  if (message.content.toLowerCase().startsWith("avatar:")) {
    const profilNameWithNumber = message.content.substring(7).trim();
    const match = profilNameWithNumber.match(/^(.*) (\d+)$/);

    if (match) {
      // SINGLE AVATAR
      const profilName = match[1].trim();
      const number = parseInt(match[2], 10);

      axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, { headers: headers })
        .then(response => {
          const avatars = response.data.avatars;
          const nouvelleExtension = "@3x.png";

          if (avatars && !isNaN(number) && number >= 1 && number <= avatars.length) {
            const avatarUrl = avatars[number - 1].url.replace(".png", nouvelleExtension);
            
            const avatarEmbed = new EmbedBuilder()
              .setTitle(`Avatar ${number} de ${profilName}`)
              .setImage(avatarUrl)
              .setColor("#0099ff")
              .setURL(avatarUrl); 

            message.reply({ embeds: [avatarEmbed] });
          } else {
            message.reply(`Numéro d'avatar invalide pour ${profilName}. (1 à ${avatars ? avatars.length : 0})`);
          }
        })
        .catch(error => message.reply("Une erreur s'est produite (joueur introuvable ?)."));
    
    } else {
      // All AVATARS PREVIEW
      const profilName = profilNameWithNumber;

      try {
        const response = await axios.get(`https://api.wolvesville.com/players/search?username=${profilName}`, { headers: headers });
        const avatars = response.data.avatars;
        
        if (!avatars || avatars.length === 0) {
           message.reply(`Aucun avatar trouvé pour ${profilName}.`);
           return;
        }

        const nouvelleExtension = "@3x.png";
        const chunkSize = 12; // Numbers of avatars per page
        const totalPages = Math.ceil(avatars.length / chunkSize);

        for (let i = 0; i < avatars.length; i += chunkSize) {
          const avatarsChunk = avatars.slice(i, i + chunkSize);
          const pageNum = (i / chunkSize) + 1;

          // Download all images in the chunk concurrently
          const imageBuffers = await Promise.all(
            avatarsChunk.map(avatar => 
              downloadImage(avatar.url.replace(".png", nouvelleExtension), axios)
            )
          );
          
          let compositeInputs = [];
          let descriptionLinks = [];
          
          const avatarSize = 128; // Width and height of each avatar in the grid
          const cols = 3; // 3 columns

          for (let j = 0; j < avatarsChunk.length; j++) {
            const buffer = imageBuffers[j]; // Get the downloaded buffer
            const globalIndex = i + j + 1;
            const originalUrl = avatarsChunk[j].url.replace(".png", nouvelleExtension);

            // Clickable link in description
            descriptionLinks.push(`[Avatar ${globalIndex}](${originalUrl})`);

            if (buffer) {
              // If buffer is valid, add to composite inputs
              const x = (j % cols) * avatarSize;
              const y = Math.floor(j / cols) * avatarSize;

              compositeInputs.push({
                input: await sharp(buffer).resize(avatarSize, avatarSize).toBuffer(), // Resize to fit grid
                top: y,
                left: x
              });
            }
          }
          
          if (compositeInputs.length === 0) {
              message.reply(`Échec du téléchargement de tous les avatars pour la page ${pageNum}.`);
              continue; // Skip to next page
          }

          // Prepare dimensions for composite image
          const rows = Math.ceil(avatarsChunk.length / cols);
          const compositeWidth = cols * avatarSize;
          const compositeHeight = rows * avatarSize;

          // Create composite image
          const compositeBuffer = await sharp({
            create: {
              width: compositeWidth,
              height: compositeHeight,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
            }
          })
          .composite(compositeInputs) // Add all valid avatars
          .png()
          .toBuffer();

          // Prepare and send the embed message
          const attachmentName = `avatars_preview_p${pageNum}.png`;
          const attachment = new AttachmentBuilder(compositeBuffer, { name: attachmentName });

          const embed = new EmbedBuilder()
            .setTitle(`Avatars de ${profilName} (Page ${pageNum}/${totalPages})`)
            .setDescription(descriptionLinks.join(' | ')) // All links
            .setImage(`attachment://${attachmentName}`) // Image from attachment
            .setColor("#0099ff")
            .setFooter({ text: `Avatars ${i + 1} à ${i + avatarsChunk.length} sur ${avatars.length}` });

          // Send the message with embed and attachment
            await message.reply({ embeds: [embed], files: [attachment] });
        }

      } catch (error) {
        message.reply("Une erreur majeure est survenue lors de la création de l'aperçu.");
        console.error(error);
      }
    }
  }
}
module.exports = avatarPlayer;