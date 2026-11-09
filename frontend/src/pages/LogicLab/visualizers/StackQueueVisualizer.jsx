import { useState } from 'react';
import './Visualizer.css';

export default function StackQueueVisualizer({ step, color, readonly }) {
  const [mode, setMode] = useState('stack');
  const [stack, setStack] = useState([30, 20, 10]);
  const [queue, setQueue] = useState([10, 20, 30]);
  const [inputVal, setInputVal] = useState('');
  const [lastAction, setLastAction] = useState(null);

  const canInteract = step >= 1 && !readonly;

  // Stack ops
  const push = () => {
    const n = parseInt(inputVal);
    if (!isNaN(n)) { setStack(prev => [...prev, n]); setLastAction(`Pushed ${n}`); setInputVal(''); }
  };
  const pop = () => {
    if (stack.length === 0) return;
    setLastAction(`Popped ${stack[stack.length - 1]}`);
    setStack(prev => prev.slice(0, -1));
  };

  // Queue ops
  const enqueue = () => {
    const n = parseInt(inputVal);
    if (!isNaN(n)) { setQueue(prev => [...prev, n]); setLastAction(`Enqueued ${n}`); setInputVal(''); }
  };
  const dequeue = () => {
    if (queue.length === 0) return;
    setLastAction(`Dequeued ${queue[0]}`);
    setQueue(prev => prev.slice(1));
  };

  return (
    <div className="visualizer">
      <div className="vis-tabs">
        <button className={`vis-tab ${mode === 'stack' ? 'active' : ''}`} style={mode==='stack'?{color,borderColor:color}:{}} onClick={() => setMode('stack')}>Stack (LIFO)</button>
        <button className={`vis-tab ${mode === 'queue' ? 'active' : ''}`} style={mode==='queue'?{color,borderColor:color}:{}} onClick={() => setMode('queue')}>Queue (FIFO)</button>
      </div>

      {mode === 'stack' ? (
        <div className="stack-vis">
          <div className="stack-indicator">← TOP</div>
          <div className="stack-column">
            {[...stack].reverse().map((val, i) => (
              <div
                key={i}
                className={`stack-cell ${i === 0 ? 'top' : ''}`}
                style={{ '--cell-color': color, borderColor: i === 0 ? color : undefined }}
              >
                {val}
                {i === 0 && <span className="stack-top-label">TOP</span>}
              </div>
            ))}
            {stack.length === 0 && <div className="stack-empty">Empty</div>}
          </div>
        </div>
      ) : (
        <div className="queue-vis">
          <div className="queue-label-row">
            <span className="queue-end-label">FRONT ←</span>
            <span className="queue-end-label">→ REAR</span>
          </div>
          <div className="queue-row">
            {queue.map((val, i) => (
              <div
                key={i}
                className={`arr-cell ${i === 0 ? 'highlighted' : ''}`}
                style={{ '--cell-color': color, borderColor: i === 0 ? color : undefined }}
              >
                {val}
              </div>
            ))}
            {queue.length === 0 && <div className="stack-empty">Empty</div>}
          </div>
        </div>
      )}

      {lastAction && (
        <div className="vis-action-badge" style={{ color }}>{lastAction}</div>
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
            {mode === 'stack' ? (
              <>
                <button className="btn btn-outline btn-sm" onClick={push}>Push</button>
                <button className="btn btn-outline btn-sm" onClick={pop}>Pop</button>
                <code className="vis-complexity">peek: O(1)</code>
              </>
            ) : (
              <>
                <button className="btn btn-outline btn-sm" onClick={enqueue}>Enqueue</button>
                <button className="btn btn-outline btn-sm" onClick={dequeue}>Dequeue</button>
                <code className="vis-complexity">O(1) amortized</code>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
