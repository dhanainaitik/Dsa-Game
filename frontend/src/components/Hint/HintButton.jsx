import React from 'react';
import { Lightbulb } from 'lucide-react';
import './Hint.css';

export default function HintButton({ isOpen, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className={`btn btn-sm btn-hint ${isOpen ? 'active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-expanded={isOpen}
      aria-label="Toggle progressive hints"
      title="View progressive hints for this challenge"
    >
      <Lightbulb size={14} className="hint-btn-icon" />
      <span>HINT</span>
    </button>
  );
}

