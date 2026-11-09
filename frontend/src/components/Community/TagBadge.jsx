import './Community.css';

const TAG_COLORS = {
  'Array': '#FF4500',
  'Graph': '#7C3AED',
  'Dynamic Programming': '#0284C7',
  'Tree': '#059669',
  'Hash Map': '#D97706',
  'Binary Search': '#DB2777',
  'Greedy': '#DC2626',
  'Backtracking': '#7C3AED',
  'Stack': '#0891B2',
  'Queue': '#2563EB',
  'Linked List': '#9333EA',
  'Sorting': '#16A34A',
  'Two Pointers': '#EA580C',
  'Sliding Window': '#0D9488',
  'Recursion': '#B45309',
  'Bit Manipulation': '#4F46E5',
  'Math': '#BE185D',
  'String': '#15803D',
  'Heap': '#7C2D12',
  'Trie': '#1D4ED8',
};

export default function TagBadge({ tag, onClick, active = false, small = false }) {
  const color = TAG_COLORS[tag] || '#525252';
  return (
    <span
      className={`tag-badge ${active ? 'active' : ''} ${small ? 'small' : ''} ${onClick ? 'clickable' : ''}`}
      style={{ '--tag-color': color }}
      onClick={onClick}
      title={tag}
    >
      {tag}
    </span>
  );
}
