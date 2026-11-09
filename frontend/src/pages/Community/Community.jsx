import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PenSquare, RefreshCw, Zap, Clock } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import PostCard from '../../components/Community/PostCard';
import CommunitySidebar from '../../components/Community/CommunitySidebar';
import './Community.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PAGE_SIZE = 12;

const POST_TYPES = ['All', 'Question', 'Discussion', 'Solution'];

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('new');
  const [activeTag, setActiveTag] = useState(null);
  const [activeType, setActiveType] = useState('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [userVotes, setUserVotes] = useState({});

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    const currentPage = reset ? 1 : page;
    try {
      const params = new URLSearchParams({
        sort,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      if (activeTag) params.set('tag', activeTag);
      if (activeType !== 'All') params.set('type', activeType.toUpperCase());

      const res = await fetch(`${API}/api/community/posts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const { posts: newPosts, total: totalCount } = await res.json();

      if (reset) {
        setPosts(newPosts);
        setPage(1);
      } else {
        setPosts((prev) => (currentPage === 1 ? newPosts : [...prev, ...newPosts]));
      }
      setTotal(totalCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sort, activeTag, activeType, page]);

  useEffect(() => {
    fetchPosts(true);
  }, [sort, activeTag, activeType]);

  const handleVote = async (postId, value) => {
    if (!user) return navigate('/login');
    const token = await user.getToken();
    const res = await fetch(`${API}/api/community/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const { vote_score, user_vote } = await res.json();
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, vote_score } : p)
      );
      setUserVotes((prev) => ({ ...prev, [postId]: user_vote }));
    }
  };

  const handleTagSelect = (tag) => {
    setActiveTag(tag);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(false);
  };

  const hasMore = posts.length < total;

  return (
    <div className="community-page page animate-fadeIn">
      <PageHeader
        title="COMMUNITY"
        description="Ask questions, share solutions, and learn together. DSA-focused discussions from fellow hunters."
      />

      <div className="container">
        {/* Controls */}
        <div className="community-controls">
          {/* Sort tabs */}
          <div className="community-sort-tabs">
            <button
              className={`comm-tab ${sort === 'new' ? 'active' : ''}`}
              onClick={() => setSort('new')}
              id="sort-new-btn"
            >
              <Clock size={15} /> Newest
            </button>
            <button
              className={`comm-tab ${sort === 'top' ? 'active' : ''}`}
              onClick={() => setSort('top')}
              id="sort-top-btn"
            >
              <Zap size={15} /> Top
            </button>
          </div>

          {/* Type filter pills */}
          <div className="community-type-pills">
            {POST_TYPES.map((type) => (
              <button
                key={type}
                className={`type-pill ${activeType === type ? 'active' : ''}`}
                onClick={() => { setActiveType(type); setPage(1); }}
                id={`type-filter-${type.toLowerCase()}`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Create + Refresh */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => fetchPosts(true)} title="Refresh">
              <RefreshCw size={15} />
            </button>
            {user && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/community/new')}
                id="create-post-btn"
              >
                <PenSquare size={15} /> New Post
              </button>
            )}
          </div>
        </div>

        {/* Active tag banner */}
        {activeTag && (
          <div className="community-tag-banner">
            Showing posts tagged: <strong>{activeTag}</strong>
            <button className="tag-clear-btn" onClick={() => setActiveTag(null)}>✕ Clear</button>
          </div>
        )}

        {/* Main layout */}
        <div className="community-layout">
          {/* Feed */}
          <div className="community-feed">
            {loading && posts.length === 0 ? (
              <div className="community-loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="post-card-skeleton" />
                ))}
              </div>
            ) : error ? (
              <div className="community-error">
                <span>⚠️ {error}</span>
                <button className="btn btn-sm" onClick={() => fetchPosts(true)}>Retry</button>
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <PenSquare size={40} opacity={0.2} />
                <strong>No posts yet</strong>
                <span style={{ fontSize: '0.9rem' }}>
                  {activeTag ? `No posts tagged "${activeTag}"` : 'Be the first to post!'}
                </span>
                {user && (
                  <button className="btn btn-primary" onClick={() => navigate('/community/new')}>
                    + Create First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="post-list stagger-children">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onVote={handleVote}
                    userVote={userVotes[post.id] || 0}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && !loading && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button className="btn btn-outline" onClick={handleLoadMore} id="load-more-btn">
                  Load More Posts ({total - posts.length} remaining)
                </button>
              </div>
            )}

            {loading && posts.length > 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                Loading...
              </div>
            )}
          </div>

          {/* Sidebar */}
          <CommunitySidebar
            activeTag={activeTag}
            onTagSelect={handleTagSelect}
            onCreatePost={() => navigate('/community/new')}
          />
        </div>
      </div>
    </div>
  );
}
