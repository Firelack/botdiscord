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
