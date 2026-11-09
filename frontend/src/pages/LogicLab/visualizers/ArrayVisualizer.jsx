import { useState } from 'react';
import './Visualizer.css';

const DEFAULT_ARRAY = [12, 47, 8, 93, 35, 61];

export default function ArrayVisualizer({ step, color, readonly }) {
  const [arr, setArr] = useState(DEFAULT_ARRAY);
  const [selected, setSelected] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [highlighted, setHighlighted] = useState([]);

  const canInteract = step >= 1 && !readonly;

  const addElement = () => {
    const n = parseInt(inputVal);
    if (!isNaN(n)) { setArr(prev => [...prev, n]); setInputVal(''); }
  };

  const removeElement = (idx) => {
    if (!canInteract) return;
    setArr(prev => prev.filter((_, i) => i !== idx));
    if (selected === idx) setSelected(null);
  };

  const scanAll = () => {
    setHighlighted([]);
    arr.forEach((_, i) => {
      setTimeout(() => setHighlighted(h => [...h, i]), i * 200);
    });
    setTimeout(() => setHighlighted([]), arr.length * 200 + 500);
  };

  return (
    <div className="visualizer">
      <div className="vis-label">Array — {arr.length} elements</div>

      {/* Index labels */}
      <div className="array-vis-wrapper">
        <div className="arr-indices">
          {arr.map((_, i) => (
            <div key={i} className="arr-index-label">{i}</div>
          ))}
        </div>

        {/* Elements */}
        <div className="arr-elements">
          {arr.map((val, i) => (
            <div
              key={`${i}-${val}`}
              className={`arr-cell ${selected === i ? 'selected' : ''} ${highlighted.includes(i) ? 'highlighted' : ''}`}
              style={{
                '--cell-color': color,
                borderColor: selected === i ? color : highlighted.includes(i) ? color : undefined,
              }}
              onClick={() => canInteract && setSelected(selected === i ? null : i)}
              onDoubleClick={() => canInteract && removeElement(i)}
              title={canInteract ? 'Click to select. Double-click to remove.' : ''}
            >
              <span className="arr-cell-value">{val}</span>
            </div>
          ))}

          {/* Memory address footer */}
        </div>

        <div className="arr-addresses">
          {arr.map((_, i) => (
            <div key={i} className="arr-address-label">0x{(1000 + i * 4).toString(16)}</div>
          ))}
        </div>
      </div>

      {/* Info panel */}
      {selected !== null && (
        <div className="vis-info-panel" style={{ borderColor: `${color}44` }}>
          <div className="vis-info-row">
            <span>Index</span><code>{selected}</code>
          </div>
          <div className="vis-info-row">
            <span>Value</span><code>{arr[selected]}</code>
          </div>
          <div className="vis-info-row">
            <span>Access time</span><code>O(1)</code>
          </div>
          <div className="vis-info-row">
            <span>Memory</span><code>0x{(1000 + selected * 4).toString(16)}</code>
          </div>
        </div>
      )}

      {/* Controls */}
      {canInteract && (
        <div className="vis-controls">
          <div className="vis-control-row">
            <input
              className="input"
              style={{ maxWidth: 100 }}
              type="number"
              placeholder="Value"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addElement()}
            />
            <button className="btn btn-outline btn-sm" onClick={addElement}>Push</button>
            <button className="btn btn-outline btn-sm" onClick={() => setArr(prev => prev.slice(0, -1))}>Pop</button>
            <button className="btn btn-ghost btn-sm" onClick={scanAll} style={{ color }}>Scan All →</button>
          </div>
          {step >= 2 && (
            <p className="vis-experiment-hint">Double-click any cell to remove it. Try scanning to see O(n) traversal.</p>
          )}
        </div>
      )}
    </div>
  );
}
