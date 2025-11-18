/**
 * Post an announcement to a clan in Wolvesville.
 * @param {object} axios - The axios instance for making HTTP requests.
 * @param {object} headers - The headers to include in the request.
 * @param {string} clanId - The ID of the clan to post the announcement to.
 * @param {string} messageContent - The content of the announcement message.
 * @returns {Promise<void>}
 */
function postAnnouncement(axios, headers, clanId, messageContent) {
  axios.post(`https://api.wolvesville.com/clans/${clanId}/announcements`, {
    message: messageContent
  }, {
    headers: headers
  })
  .then(response => {
    console.log(`📢 Annonce envoyée avec succès : "${messageContent}"`);
  })
  .catch(error => {
    console.error("❌ Erreur lors de l’envoi de l’annonce :", error.response?.data || error.message);
  });
}

module.exports = postAnnouncement;
