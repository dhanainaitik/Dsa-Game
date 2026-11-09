import { useState } from 'react';
import './Visualizer.css';

function buildFibTable(n) {
  const table = [0, 1];
  for (let i = 2; i <= n; i++) table[i] = table[i - 1] + table[i - 2];
  return table.slice(0, n + 1);
}

export default function DPVisualizer({ step, color, readonly }) {
  const [n, setN] = useState(8);
  const [revealed, setRevealed] = useState([0, 1]);
  const [isBuilding, setIsBuilding] = useState(false);
  const table = buildFibTable(n);
  const canInteract = step >= 1 && !readonly;

  const build = () => {
    setIsBuilding(true);
    setRevealed([0, 1]);
    for (let i = 2; i <= n; i++) {
      const idx = i;
      setTimeout(() => setRevealed(prev => [...prev, idx]), (idx - 1) * 350);
    }
    setTimeout(() => setIsBuilding(false), (n - 1) * 350 + 300);
  };

  const reset = () => { setRevealed([0, 1]); setIsBuilding(false); };

  return (
    <div className="visualizer">
      <div className="vis-label">Dynamic Programming — Fibonacci (tabulation)</div>

      <div className="dp-wrapper">
        {/* Indices */}
        <div className="arr-indices">
          {table.map((_, i) => <div key={i} className="arr-index-label">dp[{i}]</div>)}
        </div>

        {/* Table cells */}
        <div className="arr-elements">
          {table.map((val, i) => {
            const isRevealed = revealed.includes(i);
            const isCurrent = revealed[revealed.length - 1] === i && i > 1;
            return (
              <div
                key={i}
                className={`arr-cell ${isRevealed ? 'highlighted' : ''} ${isCurrent ? 'selected' : ''}`}
                style={{
                  '--cell-color': color,
                  minWidth: 48,
                  borderColor: isCurrent ? color : isRevealed ? `${color}55` : undefined,
                  opacity: isRevealed ? 1 : 0.25,
                  transition: 'all 300ms ease',
                }}
              >
                <span className="arr-cell-value">{isRevealed ? val : '?'}</span>
              </div>
            );
          })}
        </div>

        {/* Formula */}
        {revealed.length > 2 && (
          <div className="dp-formula animate-fadeIn" style={{ color }}>
            dp[i] = dp[i-1] + dp[i-2]
          </div>
        )}
      </div>

      {canInteract && (
        <div className="vis-controls">
          <div className="vis-control-row">
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>n =</span>
            <input
              className="input"
              type="number"
              min={3}
              max={12}
              value={n}
              style={{ maxWidth: 70 }}
              onChange={e => { setN(Number(e.target.value)); reset(); }}
            />
            <button className="btn btn-outline btn-sm" onClick={build} disabled={isBuilding} style={{ color }}>
              Build Table
            </button>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Reset</button>
          </div>
          <p className="vis-experiment-hint">Watch subproblems fill the table bottom-up.</p>
        </div>
      )}
    </div>
  );
}
