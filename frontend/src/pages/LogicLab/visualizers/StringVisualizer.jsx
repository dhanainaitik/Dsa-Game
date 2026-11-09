import { useState } from 'react';
import './Visualizer.css';

const DEFAULT_STRING = 'hello world';

export default function StringVisualizer({ step, color, readonly }) {
  const [str, setStr] = useState(DEFAULT_STRING);
  const [selected, setSelected] = useState(null);
  const [highlighted, setHighlighted] = useState([]);
  const [inputStr, setInputStr] = useState('');

  const canInteract = step >= 1 && !readonly;

  const highlight = (indices) => {
    setHighlighted(indices);
    setTimeout(() => setHighlighted([]), 1500);
  };

  const findVowels = () => {
    const vowels = [...str].reduce((acc, c, i) => 'aeiouAEIOU'.includes(c) ? [...acc, i] : acc, []);
    highlight(vowels);
  };

  const reverse = () => setStr(s => s.split('').reverse().join(''));

  return (
    <div className="visualizer">
      <div className="vis-label">String — length {str.length} · immutable concept</div>

      <div className="string-vis-wrapper">
        <div className="arr-indices">
          {[...str].map((_, i) => (
            <div key={i} className="arr-index-label" style={{ width: 36 }}>{i}</div>
          ))}
        </div>

        <div className="arr-elements">
          {[...str].map((ch, i) => (
            <div
              key={i}
              className={`arr-cell ${selected === i ? 'selected' : ''} ${highlighted.includes(i) ? 'highlighted' : ''}`}
              style={{
                '--cell-color': color,
                borderColor: selected === i ? color : highlighted.includes(i) ? color : undefined,
                width: 36,
                minWidth: 36,
              }}
              onClick={() => canInteract && setSelected(selected === i ? null : i)}
            >
              <span className="arr-cell-value" style={{ fontFamily: 'monospace' }}>
                {ch === ' ' ? '·' : ch}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selected !== null && (
        <div className="vis-info-panel" style={{ borderColor: `${color}44` }}>
          <div className="vis-info-row"><span>Index</span><code>{selected}</code></div>
          <div className="vis-info-row"><span>Char</span><code>'{[...str][selected]}'</code></div>
          <div className="vis-info-row"><span>Char code</span><code>{str.charCodeAt(selected)}</code></div>
          <div className="vis-info-row"><span>Access</span><code>O(1)</code></div>
        </div>
      )}

      {canInteract && (
        <div className="vis-controls">
          <div className="vis-control-row">
            <input
              className="input"
              style={{ flex: 1, maxWidth: 220 }}
              value={inputStr}
              placeholder="Type a new string..."
              onChange={e => setInputStr(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && inputStr) { setStr(inputStr); setInputStr(''); } }}
            />
            <button className="btn btn-outline btn-sm" onClick={() => { if (inputStr) { setStr(inputStr); setInputStr(''); } }}>Set</button>
          </div>
          {step >= 1 && (
            <div className="vis-control-row">
              <button className="btn btn-outline btn-sm" onClick={findVowels} style={{ color }}>Highlight Vowels</button>
              <button className="btn btn-outline btn-sm" onClick={reverse}>Reverse</button>
              <button className="btn btn-outline btn-sm" onClick={() => setStr(s => s.toUpperCase())}>Uppercase</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
