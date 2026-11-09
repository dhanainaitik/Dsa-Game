import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import VoteButton from './VoteButton';
import './Community.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CommentNode({ comment, depth = 0, onReply, onVote, onDelete, currentUserId }) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasChildren = comment.children && comment.children.length > 0;

  const handleReplySubmit = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    await onReply(replyText.trim(), comment.id);
    setReplyText('');
    setReplying(false);
    setSubmitting(false);
  };

  return (
    <div className={`comment-node depth-${Math.min(depth, 4)}`}>
      {depth > 0 && <div className="comment-thread-line" />}
      <div className="comment-body">
        {/* Author row */}
        <div className="comment-author-row">
          <div className="comment-avatar">{comment.author?.username?.[0]?.toUpperCase() || '?'}</div>
          <span className="comment-username">{comment.author?.username || 'Unknown'}</span>
          <span className="comment-lvl">LVL {comment.author?.level || 1}</span>
          <span className="comment-time">{timeAgo(comment.created_at)}</span>
          {currentUserId === comment.clerk_id && (
            <button className="comment-delete-btn" onClick={() => onDelete(comment.id)} title="Delete">
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Content */}
        {!collapsed && (
          <>
            <p className="comment-content">{comment.content}</p>
            <div className="comment-actions">
              <VoteButton
                score={comment.vote_score}
                userVote={comment.userVote || 0}
                onVote={(v) => onVote(comment.id, v)}
                vertical={false}
              />
              <button className="comment-reply-btn" onClick={() => setReplying(!replying)}>
                <MessageSquare size={13} /> Reply
              </button>
              {hasChildren && (
                <button className="comment-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                  {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                  {collapsed ? 'Show' : 'Hide'} {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>

            {/* Reply input */}
            {replying && (
              <div className="comment-reply-form">
                <textarea
                  className="input comment-reply-input"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.author?.username || 'this comment'}...`}
                  rows={3}
                />
                <div className="comment-reply-actions">
                  <button className="btn btn-sm" onClick={() => { setReplying(false); setReplyText(''); }}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleReplySubmit} disabled={submitting || !replyText.trim()}>
                    {submitting ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {collapsed && (
          <button className="comment-show-btn" onClick={() => setCollapsed(false)}>
            <ChevronDown size={13} /> Show comment
          </button>
        )}
      </div>

      {/* Children */}
      {!collapsed && hasChildren && (
        <div className="comment-children">
          {comment.children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              depth={depth + 1}
              onReply={onReply}
              onVote={onVote}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Build a comment tree from flat list
function buildTree(comments) {
  const map = {};
  const roots = [];
  comments.forEach((c) => { map[c.id] = { ...c, children: [] }; });
  comments.forEach((c) => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

export default function CommentThread({ postId, comments, onCommentAdded, onCommentDeleted, sort, onSortChange }) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(comments);

  // Sync with parent
  useState(() => { setLocalComments(comments); }, [comments]);

  const getToken = async () => user?.getToken();

  const handleTopLevelSubmit = async () => {
    if (!newComment.trim() || submitting || !user) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setLocalComments((prev) => [data, ...prev]);
        setNewComment('');
        onCommentAdded?.(data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (content, parentId) => {
    if (!user) return;
    const token = await getToken();
    const res = await fetch(`${API}/api/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content, parent_id: parentId }),
    });
    const data = await res.json();
    if (res.ok) {
      setLocalComments((prev) => [...prev, data]);
      onCommentAdded?.(data);
    }
  };

  const handleVote = async (commentId, value) => {
    if (!user) return;
    const token = await getToken();
    const res = await fetch(`${API}/api/community/comments/${commentId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ value }),
    });
    const { vote_score, user_vote } = await res.json();
    setLocalComments((prev) =>
      prev.map((c) => c.id === commentId ? { ...c, vote_score, userVote: user_vote } : c)
    );
  };

  const handleDelete = async (commentId) => {
    if (!user || !confirm('Delete this comment?')) return;
    const token = await getToken();
    const res = await fetch(`${API}/api/community/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setLocalComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentDeleted?.(commentId);
    }
  };

  const tree = buildTree(localComments);

  return (
    <div className="comment-thread-wrap">
      <div className="comment-thread-header">
        <h3 className="comment-thread-title">
          <MessageSquare size={18} /> {localComments.length} Comments
        </h3>
        <div className="comment-sort-tabs">
          <button className={`comment-sort-btn ${sort === 'new' ? 'active' : ''}`} onClick={() => onSortChange('new')}>Newest</button>
          <button className={`comment-sort-btn ${sort === 'top' ? 'active' : ''}`} onClick={() => onSortChange('top')}>Top</button>
        </div>
      </div>

      {/* New comment box */}
      {user ? (
        <div className="comment-new-wrap">
          <div className="comment-new-avatar">{user.username?.[0]?.toUpperCase()}</div>
          <div className="comment-new-form">
            <textarea
              className="input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, ask a question, or leave feedback..."
              rows={3}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleTopLevelSubmit}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="comment-login-prompt">Sign in to join the discussion</div>
      )}

      {/* Comment tree */}
      <div className="comment-list">
        {tree.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <MessageSquare size={32} opacity={0.3} />
            <span>No comments yet. Be the first!</span>
          </div>
        ) : (
          tree.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              onReply={handleReply}
              onVote={handleVote}
              onDelete={handleDelete}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
