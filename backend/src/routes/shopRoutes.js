const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// Get all shop items
router.get('/items', async (req, res) => {
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
    return res.json([]);
  }
  try {
    const { data, error } = await supabase.from('items').select('*');
    if (error) throw error;
    res.json(data ?? []);
  } catch (error) {
    res.json([]);
  }
});

// Get daily deal
router.get('/daily-deal', async (req, res) => {
  res.json({ itemId: 'mock-item', discountAmount: 30 });
});

// Get map unlocks
router.get('/map-unlocks', async (req, res) => {
  res.json([
    { id: 'strings', name: 'Strings', price: 300, icon: '📜' },
    { id: 'linked-lists', name: 'Linked Lists', price: 400, icon: '🔗' },
    { id: 'trees', name: 'Trees', price: 500, icon: '🌲' },
  ]);
});

// Buy item
router.post('/buy', authMiddleware, async (req, res) => {
  const { itemId } = req.body;
  const clerkId = req.auth.userId;
  // In a real implementation: deduct coins from player_profiles and insert to user_inventory
  res.json({ success: true, itemId });
});

// Unlock region
router.post('/unlock-region', authMiddleware, async (req, res) => {
  const { topic } = req.body;
  res.json({ success: true, topic });
});

module.exports = router;
