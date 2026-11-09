const express = require('express');
const router = express.Router();
const battleGroundService = require('../services/battleGroundService');
const authMiddleware = require('../middleware/authMiddleware');

// Get current user's battle stats (tokens, medals, win-rate)
router.get('/stats', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  try {
    const stats = await battleGroundService.getPlayerBattleStats(clerkId);
    if (!stats) {
      return res.json({
        battleTokens: 0,
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
        medalPoints: 0,
        battlesWon: 0,
        battlesLost: 0,
        totalBattles: 0,
        winRate: 0,
      });
    }
    res.json(stats);
  } catch (err) {
    console.error('[BattleGroundRoutes] Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch battle stats' });
  }
});

// Check if user has sufficient tokens (>= 5) for Battle Ground entry
router.get('/check-entry', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  try {
    const check = await battleGroundService.checkBattleTokens(clerkId);
    res.json(check);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check tokens' });
  }
});

// Get Battle Ground Medals Leaderboard (Public)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await battleGroundService.getMedalLeaderboard(30);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medal leaderboard' });
  }
});

module.exports = router;
