const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const authMiddleware = require('../middleware/authMiddleware');

const DSA_TAGS = [
  'Array', 'Graph', 'Dynamic Programming', 'Tree', 'Hash Map',
  'Binary Search', 'Greedy', 'Backtracking', 'Stack', 'Queue',
  'Linked List', 'Sorting', 'Two Pointers', 'Sliding Window',
  'Recursion', 'Bit Manipulation', 'Math', 'String', 'Heap', 'Trie',
];

// ──────────────────────────────────────────────────────────────────────
// Helper: fetch author profiles for an array of clerk_ids
// ──────────────────────────────────────────────────────────────────────
async function attachProfiles(items, clerkIdField = 'clerk_id') {
  if (!items || items.length === 0) return items;
  const ids = [...new Set(items.map((i) => i[clerkIdField]))];
  const { data: profiles } = await supabase
    .from('player_profiles')
    .select('clerk_id, username, avatar_url, level, rank, title')
    .in('clerk_id', ids);

  const profileMap = {};
  (profiles || []).forEach((p) => { profileMap[p.clerk_id] = p; });
  return items.map((item) => ({
    ...item,
    author: profileMap[item[clerkIdField]] || null,
  }));
}

// ──────────────────────────────────────────────────────────────────────
// GET /api/community/posts
// Query params: tag, type, sort (new|top), page, limit
// ──────────────────────────────────────────────────────────────────────
router.get('/posts', async (req, res) => {
  try {
    const { tag, type, sort = 'new', page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('posts')
      .select('id, clerk_id, title, content, type, tags, code_lang, vote_score, views, created_at, updated_at', { count: 'exact' });

    if (tag) query = query.contains('tags', [tag]);
    if (type) query = query.eq('type', type.toUpperCase());

    if (sort === 'top') {
      query = query.order('vote_score', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: posts, error, count } = await query;
    if (error) throw error;

    // Get comment counts
    const postIds = (posts || []).map((p) => p.id);
    let commentCounts = {};
    if (postIds.length > 0) {
      const { data: counts } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);
      (counts || []).forEach((c) => {
        commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
      });
    }

    const withCounts = (posts || []).map((p) => ({
      ...p,
      comment_count: commentCounts[p.id] || 0,
      preview: p.content.substring(0, 180) + (p.content.length > 180 ? '...' : ''),
    }));

    const withProfiles = await attachProfiles(withCounts);

    res.json({ posts: withProfiles, total: count || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /api/community/posts — create a post
// ──────────────────────────────────────────────────────────────────────
router.post('/posts', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  const { title, content, type = 'DISCUSSION', tags = [], code_snippet, code_lang } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'title and content are required' });
  }
  if (title.length > 200) {
    return res.status(400).json({ message: 'Title too long (max 200 chars)' });
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({ clerk_id: clerkId, title: title.trim(), content, type: type.toUpperCase(), tags, code_snippet, code_lang })
      .select()
      .single();

    if (error) throw error;
    const [withAuthor] = await attachProfiles([data]);
    res.status(201).json(withAuthor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// GET /api/community/posts/:id — single post
// ──────────────────────────────────────────────────────────────────────
router.get('/posts/:id', async (req, res) => {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !post) return res.status(404).json({ message: 'Post not found' });

    // Increment view count (fire-and-forget)
    supabase.from('posts').update({ views: post.views + 1 }).eq('id', req.params.id).then(() => {});

    const [withAuthor] = await attachProfiles([post]);
    res.json(withAuthor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch post', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// PATCH /api/community/posts/:id — edit own post
// ──────────────────────────────────────────────────────────────────────
router.patch('/posts/:id', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  const { title, content, tags, code_snippet, code_lang } = req.body;

  try {
    const { data: existing } = await supabase.from('posts').select('clerk_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    if (existing.clerk_id !== clerkId) return res.status(403).json({ message: 'Not your post' });

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = tags;
    if (code_snippet !== undefined) updates.code_snippet = code_snippet;
    if (code_lang !== undefined) updates.code_lang = code_lang;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('posts').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update post', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// DELETE /api/community/posts/:id — delete own post
// ──────────────────────────────────────────────────────────────────────
router.delete('/posts/:id', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  try {
    const { data: existing } = await supabase.from('posts').select('clerk_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    if (existing.clerk_id !== clerkId) return res.status(403).json({ message: 'Not your post' });

    await supabase.from('posts').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete post', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /api/community/posts/:id/vote
// body: { value: 1 | -1 }
// ──────────────────────────────────────────────────────────────────────
router.post('/posts/:id/vote', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  const { value } = req.body;
  const postId = req.params.id;

  if (![1, -1].includes(value)) {
    return res.status(400).json({ message: 'value must be 1 or -1' });
  }

  try {
    // Check existing vote
    const { data: existing } = await supabase
      .from('votes')
      .select('id, value')
      .eq('clerk_id', clerkId)
      .eq('post_id', postId)
      .maybeSingle();

    let delta = 0;

    if (existing) {
      if (existing.value === value) {
        // Toggle off — remove vote
        await supabase.from('votes').delete().eq('id', existing.id);
        delta = -value;
      } else {
        // Flip vote
        await supabase.from('votes').update({ value }).eq('id', existing.id);
        delta = value * 2;
      }
    } else {
      // New vote
      await supabase.from('votes').insert({ clerk_id: clerkId, post_id: postId, value });
      delta = value;
    }

    // Update post score
    const { data: post } = await supabase.from('posts').select('vote_score').eq('id', postId).single();
    const newScore = (post?.vote_score || 0) + delta;
    const { data: updated } = await supabase
      .from('posts').update({ vote_score: newScore }).eq('id', postId).select('vote_score').single();

    const userVote = existing
      ? (existing.value === value ? 0 : value)
      : value;

    res.json({ vote_score: updated?.vote_score ?? newScore, user_vote: userVote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Vote failed', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// GET /api/community/posts/:id/comments
// Returns flat list — client builds tree
// ──────────────────────────────────────────────────────────────────────
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { sort = 'new' } = req.query;
    const order = sort === 'top' ? 'vote_score' : 'created_at';

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', req.params.id)
      .order(order, { ascending: sort !== 'top' });

    if (error) throw error;
    const withProfiles = await attachProfiles(comments || []);
    res.json(withProfiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /api/community/posts/:id/comments — add comment/reply
// body: { content, parent_id? }
// ──────────────────────────────────────────────────────────────────────
router.post('/posts/:id/comments', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  const { content, parent_id } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'content is required' });
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: req.params.id, clerk_id: clerkId, content: content.trim(), parent_id: parent_id || null })
      .select()
      .single();

    if (error) throw error;
    const [withAuthor] = await attachProfiles([data]);
    res.status(201).json(withAuthor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// DELETE /api/community/comments/:id
// ──────────────────────────────────────────────────────────────────────
router.delete('/comments/:id', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  try {
    const { data: existing } = await supabase.from('comments').select('clerk_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ message: 'Comment not found' });
    if (existing.clerk_id !== clerkId) return res.status(403).json({ message: 'Not your comment' });

    await supabase.from('comments').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /api/community/comments/:id/vote
// ──────────────────────────────────────────────────────────────────────
router.post('/comments/:id/vote', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  const { value } = req.body;
  const commentId = req.params.id;

  if (![1, -1].includes(value)) {
    return res.status(400).json({ message: 'value must be 1 or -1' });
  }

  try {
    const { data: existing } = await supabase
      .from('votes')
      .select('id, value')
      .eq('clerk_id', clerkId)
      .eq('comment_id', commentId)
      .maybeSingle();

    let delta = 0;
    if (existing) {
      if (existing.value === value) {
        await supabase.from('votes').delete().eq('id', existing.id);
        delta = -value;
      } else {
        await supabase.from('votes').update({ value }).eq('id', existing.id);
        delta = value * 2;
      }
    } else {
      await supabase.from('votes').insert({ clerk_id: clerkId, comment_id: commentId, value });
      delta = value;
    }

    const { data: comment } = await supabase.from('comments').select('vote_score').eq('id', commentId).single();
    const newScore = (comment?.vote_score || 0) + delta;
    const { data: updated } = await supabase
      .from('comments').update({ vote_score: newScore }).eq('id', commentId).select('vote_score').single();

    const userVote = existing ? (existing.value === value ? 0 : value) : value;
    res.json({ vote_score: updated?.vote_score ?? newScore, user_vote: userVote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Vote failed', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// GET /api/community/tags — available DSA tags
// ──────────────────────────────────────────────────────────────────────
router.get('/tags', (req, res) => {
  res.json(DSA_TAGS);
});

// ──────────────────────────────────────────────────────────────────────
// GET /api/community/trending — top 5 posts by vote_score this week
// ──────────────────────────────────────────────────────────────────────
router.get('/trending', async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, vote_score, views, created_at, type, tags')
      .gte('created_at', weekAgo)
      .order('vote_score', { ascending: false })
      .limit(5);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch trending', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────
// GET /api/community/posts/:id/user-vote — get current user's vote on a post
// ──────────────────────────────────────────────────────────────────────
router.get('/posts/:id/user-vote', authMiddleware, async (req, res) => {
  const clerkId = req.auth.userId;
  try {
    const { data } = await supabase
      .from('votes')
      .select('value')
      .eq('clerk_id', clerkId)
      .eq('post_id', req.params.id)
      .maybeSingle();
    res.json({ user_vote: data?.value || 0 });
  } catch (err) {
    res.json({ user_vote: 0 });
  }
});

module.exports = router;
