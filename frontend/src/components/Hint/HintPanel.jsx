import React from 'react';
import { Lightbulb, X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './Hint.css';

export default function HintPanel({
  hints = [],
  hintLevel = 1,
  onNextLevel,
  onPrevLevel,
  onClose,
  questionTitle = 'Challenge',
}) {
  if (!hints || hints.length === 0) {
    return (
      <div className="hint-panel animate-fadeIn">
        <div className="hint-panel-header">
          <div className="hint-panel-title-wrap">
            <span className="hint-header-icon-badge">
              <Lightbulb size={16} />
            </span>
            <span className="hint-header-label">HINTS / GENERAL DIRECTION</span>
          </div>
          <button className="hint-close-btn" onClick={onClose} aria-label="Close hints">
            <X size={16} />
          </button>
        </div>
        <div className="hint-panel-body">
          <p className="hint-content-text">
            Start by tracing the simplest base case manually on paper. Consider which data structure or traversal technique allows you to process elements efficiently.
          </p>
        </div>
      </div>
    );
  }

  const currentHintIndex = Math.min(Math.max(0, hintLevel - 1), hints.length - 1);
  const currentHint = hints[currentHintIndex];
  const isLastLevel = currentHintIndex >= hints.length - 1;
  const hasPrevious = currentHintIndex > 0;
  const totalLevels = hints.length;

  return (
    <div className="hint-panel animate-fadeIn" role="region" aria-label="Problem Hints">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="hint-panel-header">
        <div className="hint-panel-title-wrap">
          <span className="hint-header-icon-badge">
            <Lightbulb size={16} />
          </span>
          <div className="hint-header-meta">
            <span className="hint-header-prefix">
              HINT 0{currentHint.level} / {currentHint.title}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="hint-close-btn"
          onClick={onClose}
          aria-label="Close hint panel"
          title="Close hint panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* ─── Body ──────────────────────────────────────────── */}
      <div className="hint-panel-body">
        <div className="hint-content-text">
          {currentHint.content.split('\n').map((line, idx) => (
            <p key={idx} className={line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.') ? 'hint-list-item' : ''}>
              {line}
            </p>
          ))}
        </div>

        {/* Message displayed upon reaching Level 3 */}
        {isLastLevel && (
          <div className="hint-completed-banner">
            <CheckCircle2 size={16} className="hint-completed-icon" />
            <span>You have unlocked all hints. Try implementing the solution yourself!</span>
          </div>
        )}
      </div>

      {/* ─── Footer ────────────────────────────────────────── */}
      <div className="hint-panel-footer">
        {/* Progression Indicator (e.g. 1/3, 2/3, 3/3) */}
        <div className="hint-progress-indicator">
          <div className="hint-step-bars">
            {hints.map((h, i) => (
              <span
                key={i}
                className={`hint-step-bar ${i <= currentHintIndex ? 'filled' : ''} ${i === currentHintIndex ? 'current' : ''}`}
                title={`Level ${i + 1}: ${h.title}`}
              />
            ))}
          </div>
          <span className="hint-progress-text">
            {currentHintIndex + 1} / {totalLevels}
          </span>
        </div>

        {/* Level Controls */}
        <div className="hint-actions">
          {hasPrevious && (
            <button
              type="button"
              className="hint-nav-btn prev"
              onClick={onPrevLevel}
              title="Review previous hint"
            >
              <ArrowLeft size={13} />
              <span>PREVIOUS</span>
            </button>
          )}

          {!isLastLevel ? (
            <button
              type="button"
              className="hint-nav-btn next"
              onClick={onNextLevel}
              title="Unlock next level hint"
            >
              <span>NEXT HINT</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <span className="hint-max-badge">ALL HINTS UNLOCKED</span>
          )}
        </div>
      </div>
    </div>
  );
}

