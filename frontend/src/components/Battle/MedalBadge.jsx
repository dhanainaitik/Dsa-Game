import React from 'react';
import './MedalBadge.css';

const MEDAL_CONFIG = {
  gold:   { emoji: '🥇', label: 'Gold',   color: '#FFD600', border: '#b45309' },
  silver: { emoji: '🥈', label: 'Silver', color: '#e5e7eb', border: '#6b7280' },
  bronze: { emoji: '🥉', label: 'Bronze', color: '#fed7aa', border: '#b45309' },
};

export default function MedalBadge({ type = 'gold', count = 0, size = 'md', showZero = false }) {
  if (!showZero && count <= 0) return null;

  const cfg = MEDAL_CONFIG[type] || MEDAL_CONFIG.gold;

  return (
    <div
      className={`medal-badge medal-${type} size-${size}`}
      style={{ '--medal-color': cfg.color, '--medal-border': cfg.border }}
    >
      <span className="medal-emoji">{cfg.emoji}</span>
      <div className="medal-info">
        <span className="medal-count">{count}</span>
        <span className="medal-label">{cfg.label}</span>
      </div>
    </div>
  );
}
