import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Clock } from 'lucide-react';
import VoteButton from './VoteButton';
import TagBadge from './TagBadge';
import './Community.css';

const POST_TYPE_CONFIG = {
  QUESTION:   { label: 'Q', color: '#0284C7', bg: '#EFF6FF', text: 'Question' },
  DISCUSSION: { label: 'D', color: '#FFBD00', bg: '#FFFBEB', text: 'Discussion' },
  SOLUTION:   { label: 'S', color: '#10B981', bg: '#ECFDF5', text: 'Solution' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PostCard({ post, onVote, userVote = 0 }) {
  const typeConfig = POST_TYPE_CONFIG[post.type] || POST_TYPE_CONFIG.DISCUSSION;

  return (
    <div className="post-card animate-fadeIn">
      {/* Vote column */}
      <div className="post-card-vote">
        <VoteButton
          score={post.vote_score}
          userVote={userVote}
          onVote={(v) => onVote?.(post.id, v)}
          vertical={true}
        />
      </div>

      {/* Main content */}
      <div className="post-card-body">
        {/* Type badge + tags */}
        <div className="post-card-meta-top">
          <span
            className="post-type-badge"
            style={{ background: typeConfig.bg, color: typeConfig.color, borderColor: typeConfig.color }}
            title={typeConfig.text}
          >
            {typeConfig.text}
          </span>
          {post.tags?.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} small />
          ))}
          {post.tags?.length > 3 && (
            <span className="post-card-more-tags">+{post.tags.length - 3}</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/community/${post.id}`} className="post-card-title">
          {post.title}
        </Link>

        {/* Preview text */}
        <p className="post-card-preview">{post.preview || post.content?.substring(0, 180)}</p>

        {/* Footer */}
        <div className="post-card-footer">
          <div className="post-card-author">
            <div className="post-author-avatar">{post.author?.username?.[0]?.toUpperCase() || '?'}</div>
            <span className="post-author-name">{post.author?.username || 'Anonymous'}</span>
            <span className="post-author-level">LVL {post.author?.level || 1}</span>
          </div>
          <div className="post-card-stats">
            <span className="post-stat">
              <MessageSquare size={13} /> {post.comment_count || 0}
            </span>
            <span className="post-stat">
              <Eye size={13} /> {post.views || 0}
            </span>
            <span className="post-stat">
              <Clock size={13} /> {timeAgo(post.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Code snippet indicator */}
      {post.code_lang && (
        <div className="post-card-code-badge" title="Contains code snippet">
          {'</>'}
        </div>
      )}
    </div>
  );
}
