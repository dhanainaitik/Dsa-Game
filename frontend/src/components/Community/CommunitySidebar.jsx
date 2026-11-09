import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Tag, PenSquare, Flame, Hash } from 'lucide-react';
import TagBadge from './TagBadge';
import './Community.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ALL_TAGS = [
  'Array', 'Graph', 'Dynamic Programming', 'Tree', 'Hash Map',
  'Binary Search', 'Greedy', 'Backtracking', 'Stack', 'Queue',
  'Linked List', 'Sorting', 'Two Pointers', 'Sliding Window',
  'Recursion', 'Bit Manipulation', 'Math', 'String', 'Heap', 'Trie',
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CommunitySidebar({ activeTag, onTagSelect, onCreatePost }) {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/community/trending`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setTrending(data))
      .catch(() => {});
  }, []);

  return (
    <aside className="community-sidebar">
      {/* Create Post CTA */}
      <div className="sidebar-cta-card">
        <div className="sidebar-cta-icon"><PenSquare size={24} /></div>
        <div className="sidebar-cta-text">
          <strong>Share your knowledge</strong>
          <span>Ask questions, post solutions, start discussions</span>
        </div>
        <button className="btn btn-primary" onClick={onCreatePost} id="sidebar-create-post-btn">
          + New Post
        </button>
      </div>

      {/* Trending Posts */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <Flame size={16} /> Trending This Week
        </div>
        {trending.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 0' }}>No trending posts yet.</div>
        ) : (
          <div className="sidebar-trending-list">
            {trending.map((post, i) => (
              <Link to={`/community/${post.id}`} key={post.id} className="sidebar-trending-item">
                <span className="sidebar-trending-rank">{i + 1}</span>
                <div className="sidebar-trending-content">
                  <span className="sidebar-trending-title">{post.title}</span>
                  <div className="sidebar-trending-meta">
                    <TrendingUp size={11} /> {post.vote_score} votes · {timeAgo(post.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tag Filter */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <Hash size={16} /> Filter by Topic
        </div>
        {activeTag && (
          <button
            className="sidebar-clear-tag"
            onClick={() => onTagSelect(null)}
          >
            Clear: {activeTag} ✕
          </button>
        )}
        <div className="sidebar-tag-cloud">
          {ALL_TAGS.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              small
              active={activeTag === tag}
              onClick={() => onTagSelect(activeTag === tag ? null : tag)}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="sidebar-section sidebar-stats">
        <div className="sidebar-section-title"><Tag size={16} /> Community</div>
        <div className="sidebar-stat-grid">
          <div className="sidebar-stat-item">
            <span className="sidebar-stat-value">12</span>
            <span className="sidebar-stat-label">Topics</span>
          </div>
          <div className="sidebar-stat-item">
            <span className="sidebar-stat-value">DSA</span>
            <span className="sidebar-stat-label">Focus</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
