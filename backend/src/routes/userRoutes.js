const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// Get current user profile — auto-creates profile on first login (no webhook needed)
router.get('/me', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
    const clerkUser = req.auth.sessionClaims;
    return res.json({
      clerk_id: clerkId,
      username: clerkUser?.username || clerkUser?.first_name || 'Player',
      email: clerkUser?.email || null,
      level: 1,
      xp: 0,
      xp_to_next_level: 550,
      coins: 100,
      rank: 'BRONZE'
    });
  }

  try {
    // Try to fetch existing profile
    let { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    // If no profile exists yet, create one (handles new sign-ups without a webhook)
    if (!data || (error && error.code === 'PGRST116')) {
      // Fetch Clerk user info from the token claims
      const clerkUser = req.auth.sessionClaims;
      const email = clerkUser?.email ?? null;
      const username =
        clerkUser?.username ??
        clerkUser?.first_name ??
        email?.split('@')[0] ??
        clerkId;

      const { data: newProfile, error: insertError } = await supabase
        .from('player_profiles')
        .insert({
          clerk_id: clerkId,
          username,
          email,
          level: 1,
          xp: 0,
          xp_to_next_level: 550,
          coins: 100,
          rank: 'BRONZE',
          battle_tokens: 0,
          gold_medals: 0,
          silver_medals: 0,
          bronze_medals: 0,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[UserRoutes] Failed to auto-create profile:', insertError.message);
        return res.status(500).json({ message: 'Could not create player profile', error: insertError.message });
      }

      console.log(`[UserRoutes] Auto-created player profile for Clerk user: ${clerkId}`);
      return res.json(newProfile);
    }

    if (error) {
      console.error('[UserRoutes] DB error fetching profile:', error.message);
      return res.status(500).json({ message: 'Database error', error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update profile
router.patch('/profile', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  const updates = req.body;

  const { data, error } = await supabase
    .from('player_profiles')
    .update(updates)
    .eq('clerk_id', clerkId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: 'Update failed', error: error.message });
  }

  res.json({ success: true, profile: data });
});

// Get profile by username (public)
router.get('/:username', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('username', req.params.username)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
