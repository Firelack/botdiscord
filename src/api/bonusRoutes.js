// Proxy route replacing the direct Supabase call from the frontend.
const express = require("express");
const supabase = require("../utils/superbaseClient");

const router = express.Router();

// GET /api/bonus/:clanId
router.get("/:clanId", async (req, res) => {
  const { clanId } = req.params;

  try {
    const { data: players, error } = await supabase
      .from("players")
      .select("username, quest_modifier")
      .eq("clan_id", clanId)
      .eq("in_clan", true)
      .neq("quest_modifier", 0);

    if (error) throw error;

    const sortAlphabetically = (a, b) => a.username.localeCompare(b.username);

    const bonus = players
      .filter((p) => p.quest_modifier < 0)
      .sort(sortAlphabetically)
      .map((p) => ({
        username: p.username,
        amount: Math.abs(p.quest_modifier),
      }));

    const malus = players
      .filter((p) => p.quest_modifier > 0)
      .sort(sortAlphabetically)
      .map((p) => ({
        username: p.username,
        amount: p.quest_modifier,
      }));

    res.status(200).json({ bonus, malus });
  } catch (err) {
    console.error("Erreur lors de la récupération des bonus/malus:", err);
    res
      .status(500)
      .json({
        error: "Erreur interne lors de la récupération des bonus/malus.",
      });
  }
});

module.exports = router;
