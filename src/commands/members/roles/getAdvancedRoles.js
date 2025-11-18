/**
 * Get advanced role mapping from Wolvesville API and reply to the message.
 * @param {Object} message - The message object from the chat.
 * @param {Object} axios - The axios instance for making HTTP requests.
 * @param {Object} headers - The headers to include in the HTTP request.
 * @returns {void}
 */
function getAdvancedRoles(message, axios, headers) {
// Fetch advanced role mapping
    if (message.content.toLowerCase().startsWith("advanced:")) {
      var requestedRole = message.content.substring(9).trim();
      requestedRole = requestedRole.toLowerCase();

      axios.get(`https://api.wolvesville.com/roles`, {
        headers: headers
      })
        .then(response => {
          const data = response.data;
          if (data.advancedRolesMapping && data.advancedRolesMapping.hasOwnProperty(requestedRole)) {
            const mapping = data.advancedRolesMapping[requestedRole];
            const mappingEntries = Object.entries(mapping);

            const formattedResponse = mappingEntries.map(([key, value], index) => `> - ${value}`).join('\n');

            message.reply(`**__Mapping du rôle avancé "${requestedRole}":__**\n${formattedResponse}`);
          } else {
            message.reply(`Le rôle avancé de "${requestedRole}" n'a pas été trouvé.`);
          }
        })
        .catch(error => {
          message.reply("Une erreur s'est produite lors de la requête.");
          console.error(error);
        });
    }
}
module.exports = getAdvancedRoles;