import { useState } from 'react';
import './Visualizer.css';

const INIT_LIST = [10, 25, 37, 52, 68];

export default function LinkedListVisualizer({ step, color, readonly }) {
  const [list, setList] = useState(INIT_LIST);
  const [active, setActive] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [traversing, setTraversing] = useState(-1);

  const canInteract = step >= 1 && !readonly;

  const prepend = () => {
    const n = parseInt(inputVal);
    if (!isNaN(n)) { setList(prev => [n, ...prev]); setInputVal(''); }
  };

  const append = () => {
    const n = parseInt(inputVal);
    if (!isNaN(n)) { setList(prev => [...prev, n]); setInputVal(''); }
  };

  const removeHead = () => setList(prev => prev.slice(1));
  const removeTail = () => setList(prev => prev.slice(0, -1));

  const traverse = () => {
    setTraversing(0);
    list.forEach((_, i) => {
      setTimeout(() => setTraversing(i), i * 400);
    });
    setTimeout(() => setTraversing(-1), list.length * 400 + 200);
  };

  return (
    <div className="visualizer">
      <div className="vis-label">Linked List — {list.length} nodes · HEAD → TAIL</div>

      <div className="ll-wrapper">
        {list.map((val, i) => (
          <div key={i} className="ll-node-group">
            <div
              className={`ll-node ${active === i ? 'active' : ''} ${traversing === i ? 'traversing' : ''}`}
              style={{
                '--node-color': color,
                borderColor: active === i ? color : traversing === i ? color : undefined,
                boxShadow: traversing === i ? `0 0 16px ${color}55` : undefined,
              }}
              onClick={() => canInteract && setActive(active === i ? null : i)}
            >
              {i === 0 && <div className="ll-head-label">HEAD</div>}
              {i === list.length - 1 && <div className="ll-tail-label">TAIL</div>}
              <div className="ll-node-val">{val}</div>
              <div className="ll-node-ptr">→ next</div>
            </div>
            {i < list.length - 1 && (
              <div className={`ll-arrow ${traversing === i ? 'active' : ''}`} style={{ color: traversing === i ? color : undefined }}>
                ──→
              </div>
            )}
            {i === list.length - 1 && (
              <div className="ll-null">null</div>
            )}
          </div>
        ))}
      </div>

      {active !== null && (
        <div className="vis-info-panel" style={{ borderColor: `${color}44` }}>
          <div className="vis-info-row"><span>Node {active}</span><code>val={list[active]}</code></div>
          <div className="vis-info-row"><span>Next</span><code>{active < list.length - 1 ? `Node(${list[active + 1]})` : 'null'}</code></div>
          <div className="vis-info-row"><span>Access: position {active}</span><code>O({active === 0 ? '1' : 'n'})</code></div>
        </div>
      )}

      {canInteract && (
        <div className="vis-controls">
          <div className="vis-control-row">
            <input
              className="input"
              style={{ maxWidth: 90 }}
              type="number"
              placeholder="Value"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            <button className="btn btn-outline btn-sm" onClick={prepend}>Prepend</button>
            <button className="btn btn-outline btn-sm" onClick={append}>Append</button>
            <button className="btn btn-outline btn-sm" onClick={removeHead}>Remove Head</button>
            <button className="btn btn-outline btn-sm" onClick={removeTail}>Remove Tail</button>
          </div>
          {step >= 2 && (
            <button className="btn btn-ghost btn-sm" onClick={traverse} style={{ color }}>
              Traverse O(n) →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
