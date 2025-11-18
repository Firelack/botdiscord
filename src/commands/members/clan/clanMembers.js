/**
 * Fetches and displays members of a clan when the "membersclan:" command is triggered.
 * @param {Object} message - The message object from Discord.
 * @param {Object} axios - The axios instance for making HTTP requests.
 * @param {Object} headers - The headers to include in the HTTP request.
 * @returns {void}
 */
function clanMembers(message, axios, headers) {
  // Member of a clan
  if (message.content.toLowerCase().startsWith("membersclan:")) {
    const clanName = message.content.substring(12).trim();

    axios
      .get(`https://api.wolvesville.com/clans/search?name=${clanName}`, {
        headers: headers,
      })
      .then((response) => {
        const clanId = response.data[0].id; // Get the clan ID from the response
        const batchSize = 10; // Number of members to fetch per request
        const totalMembers = response.data[0].memberCount; // Total number of members in the clan
        const numBatches = Math.ceil(totalMembers / batchSize);

        // Make batch requests
        const batchRequests = Array.from(
          { length: numBatches },
          (_, batchIndex) => {
            const offset = batchIndex * batchSize;
            return axios.get(
              `https://api.wolvesville.com/clans/${clanId}/members?limit=${batchSize}&offset=${offset}`,
              {
                headers: headers,
              }
            );
          }
        );

        // Wait for all requests to complete
        return Promise.all(batchRequests);
      })
      .then((batchResponses) => {
        // Use a set to track already included members
        const includedMembers = new Set();

        // Process member data as needed
        const memberInfoArray = batchResponses.flatMap((batchResponse) => {
          return batchResponse.data.map((member) => {
            // Check if the member has already been included
            if (!includedMembers.has(member.username)) {
              // Add the member to the set to avoid duplicates
              includedMembers.add(member.username);

              return {
                Username: member.username,
                XP: member.xp,
              };
            } else {
              return null; // Member already included, return null to ignore
            }
          });
        });

        // Filter out null members (already included) before sending messages
        const filteredMembers = memberInfoArray.filter(
          (member) => member !== null
        );

        // Send messages in batches of 10 members
        for (let i = 0; i < filteredMembers.length; i += 10) {
          const currentBatch = filteredMembers.slice(i, i + 10);
          const formattedBatch = currentBatch
            .map((member) => {
              return `- **__Username__**: ${member.Username} **__XP__**: ${member.XP}`;
            })
            .join("\n");
          message.reply(`Liste des membres du clan:\n${formattedBatch}`);
        }
      })
      .catch((error) => {
        message.reply("Une erreur s'est produite lors de la requête.");
        console.error(error);
      });
  }
}
module.exports = clanMembers;
