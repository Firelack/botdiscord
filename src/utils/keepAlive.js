// Express server: health check + API proxy routes (Wolvesville + Supabase bonus/malus)
const express = require("express");

// Frontend only, to delete
const cors = require("cors");
const wolvesvilleRoutes = require("../api/wolvesvilleRoutes");
const bonusRoutes = require("../api/bonusRoutes");

const app = express();

// Frontend only, to delete
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  }),
);

// Frontend only, to delete
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Le bot est en ligne !");
});

// Frontend only, to delete
app.use("/api/wolvesville", wolvesvilleRoutes);
app.use("/api/bonus", bonusRoutes);
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée." });
});

/**
 * Keep the bot alive and expose the API proxy routes.
 * @returns {void}
 */
function keepAlive() {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    // Retirer seulement le texte pour le frontend : "(proxy API)"
    console.log(`✅ Serveur Express (proxy API) démarré sur le port ${PORT}`);
  });
}

module.exports = keepAlive;
