const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// Get inventory
router.get('/', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select('*, items(*)')
      .eq('clerk_id', clerkId);

    if (error) throw error;
    res.json(data ?? []);
  } catch (error) {
    res.json([]);
  }
});

// Equip item
router.post('/equip', authMiddleware, async (req, res) => {
  const { itemId } = req.body;
  res.json({ success: true, itemId });
});

// Unequip item
router.post('/unequip', authMiddleware, async (req, res) => {
  const { itemId } = req.body;
  res.json({ success: true, itemId });
});

// Use item
router.post('/use', authMiddleware, async (req, res) => {
  const { itemId, battleId } = req.body;
  res.json({ success: true, itemId, effectApplied: true });
});

module.exports = router;
