import { ChevronUp, ChevronDown } from 'lucide-react';
import './Community.css';

export default function VoteButton({ score = 0, userVote = 0, onVote, vertical = true }) {
  return (
    <div className={`vote-btn-wrap ${vertical ? 'vertical' : 'horizontal'}`}>
      <button
        className={`vote-btn up ${userVote === 1 ? 'active' : ''}`}
        onClick={() => onVote(1)}
        title="Upvote"
        id="vote-up"
      >
        <ChevronUp size={16} />
      </button>
      <span className={`vote-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}`}>
        {score}
      </span>
      <button
        className={`vote-btn down ${userVote === -1 ? 'active' : ''}`}
        onClick={() => onVote(-1)}
        title="Downvote"
        id="vote-down"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  );
}
