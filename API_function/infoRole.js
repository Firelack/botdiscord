function infoRole(message, axios, headers) {
// Récupérer les informations d'un rôle
    if (message.content.toLowerCase().startsWith("role:") || message.content.toLowerCase().startsWith("rôle:")) {
      var roleName = message.content.substring(5).trim();
      roleName = roleName.toLowerCase();

      axios.get(`https://api.wolvesville.com/roles`, {
        headers: headers
      })
        .then(response => {
          const roles = response.data.roles;
          const selectedRole = roles.find(role => role.id === roleName);

          if (selectedRole) {
            const roleInfo = {
              "id": selectedRole.id,
              "name": selectedRole.name,
              "description": selectedRole.description,
              "image": selectedRole.image.url
            };

            message.reply(`## Informations sur le rôle:\n\n**__Nom:__** ${roleInfo.name}\n**__Description:__** ${roleInfo.description}\n**__Image:__** ${roleInfo.image}`);
          } else {
            message.reply(`Le rôle "${roleName}" n'a pas été trouvé.`);
          }
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
  }
module.exports = infoRole;