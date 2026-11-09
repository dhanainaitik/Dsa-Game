const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const supabase = require('../utils/supabase');

// Clerk Webhook — auto-provision player profile on user.created
// Configure this endpoint in the Clerk Dashboard → Webhooks → Add Endpoint:
//   URL: https://<your-domain>/api/auth/webhook
//   Events: user.created
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Webhook] CLERK_WEBHOOK_SECRET is not set.');
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  // Verify the Svix signature
  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ message: 'Missing Svix headers' });
  }

  let payload;
  try {
    const wh = new Webhook(webhookSecret);
    payload = wh.verify(req.body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  const { type, data } = payload;

  if (type === 'user.created') {
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address ?? null;
    const username = data.username ?? data.first_name ?? email?.split('@')[0] ?? clerkId;

    const { error } = await supabase.from('player_profiles').insert({
      clerk_id: clerkId,
      username,
      email,
      level: 1,
      xp: 0,
      xp_to_next_level: 550,
      coins: 100,
      rank: 'BRONZE',
    });

    if (error) {
      console.error('[Webhook] Failed to create player profile:', error.message);
      // Don't return an error — Clerk will retry the webhook
    } else {
      console.log(`[Webhook] Created player profile for Clerk user: ${clerkId}`);
    }
  }

  // Acknowledge receipt to Clerk
  res.status(200).json({ received: true });
});

module.exports = router;
