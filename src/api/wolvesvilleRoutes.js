const express = require("express");
const axios = require("axios");

const router = express.Router();

const WOLVESVILLE_API_URL = "https://api.wolvesville.com";
const API_KEY = process.env.APIKEY;

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bot ${API_KEY}`,
};

/**
 * Forward a GET request to the Wolvesville API and relay the status/body.
 * @param {import('express').Response} res
 * @param {string} path - Path on the Wolvesville API (starting with /)
 */
async function proxyGet(res, path) {
  try {
    const response = await axios.get(`${WOLVESVILLE_API_URL}${path}`, {
      headers,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response ? err.response.status : 500;
    const data = err.response
      ? err.response.data
      : { error: "Erreur interne du proxy Wolvesville." };
    res.status(status).json(data);
  }
}

// GET /api/wolvesville/players/search?username=xxx
router.get("/players/search", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res
      .status(400)
      .json({ error: 'Le paramètre "username" est requis.' });
  }
  await proxyGet(
    res,
    `/players/search?username=${encodeURIComponent(username)}`,
  );
});

// GET /api/wolvesville/clans/:clanId/info
router.get("/clans/:clanId/info", async (req, res) => {
  await proxyGet(res, `/clans/${req.params.clanId}/info`);
});

// GET /api/wolvesville/roles
router.get("/roles", async (req, res) => {
  await proxyGet(res, `/roles`);
});

// GET /api/wolvesville/clans/:clanId/quests/active
router.get("/clans/:clanId/quests/active", async (req, res) => {
  await proxyGet(res, `/clans/${req.params.clanId}/quests/active`);
});

// GET /api/wolvesville/clans/:clanId/announcements
router.get("/clans/:clanId/announcements", async (req, res) => {
  await proxyGet(res, `/clans/${req.params.clanId}/announcements`);
});

// GET /api/wolvesville/clans/:clanId/quests/available
router.get("/clans/:clanId/quests/available", async (req, res) => {
  await proxyGet(res, `/clans/${req.params.clanId}/quests/available`);
});

module.exports = router;
