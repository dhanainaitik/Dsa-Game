import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Code, X, Plus } from 'lucide-react';
import TagBadge from '../../components/Community/TagBadge';
import './CreatePost.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const POST_TYPES = ['QUESTION', 'DISCUSSION', 'SOLUTION'];
const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c', 'typescript', 'go', 'rust', 'kotlin', 'swift'];

const ALL_TAGS = [
  'Array', 'Graph', 'Dynamic Programming', 'Tree', 'Hash Map',
  'Binary Search', 'Greedy', 'Backtracking', 'Stack', 'Queue',
  'Linked List', 'Sorting', 'Two Pointers', 'Sliding Window',
  'Recursion', 'Bit Manipulation', 'Math', 'String', 'Heap', 'Trie',
];

const TYPE_CONFIG = {
  QUESTION:   { label: 'Question', desc: 'Ask the community for help', color: '#0284C7' },
  DISCUSSION: { label: 'Discussion', desc: 'Start a conversation', color: '#FFBD00' },
  SOLUTION:   { label: 'Solution', desc: 'Share your approach', color: '#10B981' },
};

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { postId } = useParams(); // if editing

  const isEditing = Boolean(postId);

  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'DISCUSSION',
    tags: [],
    code_snippet: '',
    code_lang: 'javascript',
  });
  const [showCodeBlock, setShowCodeBlock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (isEditing) {
      fetch(`${API}/api/community/posts/${postId}`)
        .then((r) => r.json())
        .then((post) => {
          setForm({
            title: post.title || '',
            content: post.content || '',
            type: post.type || 'DISCUSSION',
            tags: post.tags || [],
            code_snippet: post.code_snippet || '',
            code_lang: post.code_lang || 'javascript',
          });
          setShowCodeBlock(Boolean(post.code_snippet));
        })
        .catch(() => navigate('/community'));
    }
  }, [postId, isEditing]);

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : prev.tags.length >= 5
        ? prev.tags
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) return setError('Title is required');
    if (!form.content.trim()) return setError('Description is required');
    if (form.title.length > 200) return setError('Title too long (max 200 chars)');

    setSubmitting(true);
    try {
      const token = await user.getToken();
      const body = {
        ...form,
        code_snippet: showCodeBlock && form.code_snippet.trim() ? form.code_snippet : null,
        code_lang: showCodeBlock && form.code_snippet.trim() ? form.code_lang : null,
      };

      const url = isEditing
        ? `${API}/api/community/posts/${postId}`
        : `${API}/api/community/posts`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit post');
      }

      const data = await res.json();
      navigate(`/community/${data.id || postId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-page page animate-fadeIn">
      <div className="container cp-container">

        {/* Header */}
        <div className="cp-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/community')}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="cp-page-title">{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
        </div>

        <div className="cp-layout">
          {/* Main form */}
          <form className="cp-form-card" onSubmit={handleSubmit} id="create-post-form">
            {/* Post type selector */}
            <div className="cp-field">
              <label className="cp-label">Post Type</label>
              <div className="cp-type-grid">
                {POST_TYPES.map((type) => {
                  const cfg = TYPE_CONFIG[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      className={`cp-type-card ${form.type === type ? 'active' : ''}`}
                      style={{ '--type-color': cfg.color }}
                      onClick={() => setForm((prev) => ({ ...prev, type }))}
                      id={`type-${type.toLowerCase()}`}
                    >
                      <span className="cp-type-label">{cfg.label}</span>
                      <span className="cp-type-desc">{cfg.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="cp-field">
              <label className="cp-label" htmlFor="cp-title">
                Title <span className="cp-required">*</span>
              </label>
              <input
                id="cp-title"
                className="input"
                type="text"
                placeholder={
                  form.type === 'QUESTION' ? 'What is your question?' :
                  form.type === 'SOLUTION' ? 'Solution for: [Problem Name]' :
                  'What do you want to discuss?'
                }
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                maxLength={200}
              />
              <div className="cp-char-hint">{form.title.length} / 200</div>
            </div>

            {/* Content */}
            <div className="cp-field">
              <label className="cp-label" htmlFor="cp-content">
                Description <span className="cp-required">*</span>
              </label>
              <textarea
                id="cp-content"
                className="input cp-textarea"
                placeholder={
                  form.type === 'QUESTION'
                    ? "Describe your problem clearly. What have you tried? What's the expected output?"
                    : form.type === 'SOLUTION'
                    ? 'Explain your approach, time/space complexity, and any edge cases handled...'
                    : 'Share your thoughts, insights, or start a conversation...'
                }
                value={form.content}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, content: e.target.value }));
                  setCharCount(e.target.value.length);
                }}
                rows={10}
              />
              <div className="cp-char-hint">{charCount} chars</div>
            </div>

            {/* Code snippet toggle */}
            <div className="cp-field">
              <div className="cp-code-toggle-row">
                <label className="cp-label">Code Snippet</label>
                <button
                  type="button"
                  className={`cp-code-toggle-btn ${showCodeBlock ? 'active' : ''}`}
                  onClick={() => setShowCodeBlock(!showCodeBlock)}
                  id="toggle-code-btn"
                >
                  {showCodeBlock ? <><X size={14} /> Remove Code</> : <><Code size={14} /> Add Code</>}
                </button>
              </div>

              {showCodeBlock && (
                <div className="cp-code-section">
                  <div className="cp-lang-select-wrap">
                    <label className="cp-label-sm">Language</label>
                    <select
                      className="input cp-lang-select"
                      value={form.code_lang}
                      onChange={(e) => setForm((prev) => ({ ...prev, code_lang: e.target.value }))}
                      id="cp-lang-select"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    className="input cp-code-textarea"
                    placeholder={`// Paste your ${form.code_lang} code here...`}
                    value={form.code_snippet}
                    onChange={(e) => setForm((prev) => ({ ...prev, code_snippet: e.target.value }))}
                    rows={10}
                    spellCheck={false}
                    id="cp-code-input"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="cp-field">
              <label className="cp-label">
                Tags <span className="cp-hint">(select up to 5)</span>
              </label>
              {form.tags.length > 0 && (
                <div className="cp-selected-tags">
                  {form.tags.map((tag) => (
                    <span key={tag} className="cp-selected-tag">
                      {tag}
                      <button type="button" onClick={() => toggleTag(tag)} className="cp-tag-remove">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="cp-tag-grid">
                {ALL_TAGS.map((tag) => (
                  <TagBadge
                    key={tag}
                    tag={tag}
                    small
                    active={form.tags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
              {form.tags.length >= 5 && (
                <div className="cp-hint-text">Max 5 tags selected</div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="cp-error">⚠️ {error}</div>
            )}

            {/* Submit */}
            <div className="cp-submit-row">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/community')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !form.title.trim() || !form.content.trim()}
                id="submit-post-btn"
              >
                {submitting
                  ? isEditing ? 'Saving...' : 'Publishing...'
                  : isEditing ? 'Save Changes' : '🚀 Publish Post'}
              </button>
            </div>
          </form>

          {/* Preview panel */}
          <aside className="cp-preview-panel">
            <div className="cp-preview-card">
              <div className="cp-preview-title">📋 Tips for a Great Post</div>
              <ul className="cp-tips">
                {form.type === 'QUESTION' ? (
                  <>
                    <li>State the problem clearly</li>
                    <li>Show what you've tried</li>
                    <li>Include example inputs/outputs</li>
                    <li>Mention constraints</li>
                    <li>Add relevant code if stuck</li>
                  </>
                ) : form.type === 'SOLUTION' ? (
                  <>
                    <li>Name the problem you solved</li>
                    <li>Explain your approach</li>
                    <li>Include time & space complexity</li>
                    <li>Mention edge cases</li>
                    <li>Share alternative approaches</li>
                  </>
                ) : (
                  <>
                    <li>Be specific about the topic</li>
                    <li>Provide context and examples</li>
                    <li>Ask for opinions or insights</li>
                    <li>Keep it constructive</li>
                    <li>Share relevant resources</li>
                  </>
                )}
              </ul>
            </div>

            {/* Selected tags preview */}
            {form.tags.length > 0 && (
              <div className="cp-preview-card">
                <div className="cp-preview-title">🏷️ Selected Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {form.tags.map((tag) => <TagBadge key={tag} tag={tag} small />)}
                </div>
              </div>
            )}

            {/* Community guidelines */}
            <div className="cp-preview-card cp-guidelines">
              <div className="cp-preview-title">📏 Guidelines</div>
              <ul className="cp-tips">
                <li>Be respectful and helpful</li>
                <li>No spam or duplicate posts</li>
                <li>DSA topics only</li>
                <li>Credit original authors</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
