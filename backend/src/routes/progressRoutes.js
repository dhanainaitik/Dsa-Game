const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// Get profile by Clerk user ID
router.get('/:userId', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  try {
    const { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (error || !data) {
      // Return a default fallback profile so the frontend doesn't break
      return res.json({ level: 1, xp: 0, coins: 100 });
    }

    res.json(data);
  } catch (error) {
    res.json({ level: 1, xp: 0, coins: 100 });
  }
});

// Sync progress (upsert)
router.post('/:userId/sync', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  const { xp, coins, level } = req.body;

  try {
    const { data, error } = await supabase
      .from('player_profiles')
      .upsert(
        { clerk_id: clerkId, xp, coins, level },
        { onConflict: 'clerk_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Sync failed:', error.message);
      return res.status(500).json({ success: false, error: 'Database update failed' });
    }

    res.json({ success: true, profile: data });
  } catch (error) {
    console.error('Sync failed:', error);
    res.status(500).json({ success: false, error: 'Database update failed' });
  }
});

module.exports = router;
