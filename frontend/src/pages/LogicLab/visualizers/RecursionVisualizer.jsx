import { useState } from 'react';
import './Visualizer.css';

function buildCallStack(n) {
  const calls = [];
  function fib(k, depth = 0) {
    calls.push({ n: k, depth, type: 'call' });
    if (k <= 1) { calls.push({ n: k, depth, type: 'return', val: k }); return k; }
    const l = fib(k - 1, depth + 1);
    const r = fib(k - 2, depth + 1);
    const val = l + r;
    calls.push({ n: k, depth, type: 'return', val });
    return val;
  }
  fib(n);
  return calls;
}

export default function RecursionVisualizer({ step, color, readonly }) {
  const [n, setN] = useState(4);
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const calls = buildCallStack(n);
  const displayedCalls = calls.slice(0, frame);
  const callStack = displayedCalls
    .reduce((stack, call) => {
      if (call.type === 'call') return [...stack, call];
      return stack.slice(0, -1);
    }, [])
    .slice(-6); // show last 6 frames

  const canInteract = step >= 1 && !readonly;

  const play = () => {
    setIsPlaying(true);
    setFrame(0);
    for (let i = 0; i <= calls.length; i++) {
      setTimeout(() => {
        setFrame(i);
        if (i === calls.length) setIsPlaying(false);
      }, i * 280);
    }
  };

  const reset = () => { setFrame(0); setIsPlaying(false); };

  return (
    <div className="visualizer">
      <div className="vis-label">Recursion — Call Stack for fib({n})</div>

      <div className="recursion-vis">
        {/* Call stack display */}
        <div className="call-stack-panel">
          <div className="call-stack-label section-label">Call Stack</div>
          <div className="call-stack-frames">
            {callStack.length === 0 && (
              <div className="call-stack-empty">Stack is empty</div>
            )}
            {[...callStack].reverse().map((call, i) => (
              <div
                key={i}
                className={`call-frame ${i === 0 ? 'top-frame' : ''}`}
                style={{
                  borderColor: i === 0 ? color : undefined,
                  boxShadow: i === 0 ? `0 0 10px ${color}44` : undefined,
                }}
              >
                <span style={{ color: i === 0 ? color : undefined }}>fib({call.n})</span>
                <span className="call-depth">depth {call.depth}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress info */}
        <div className="recursion-info">
          <div className="vis-info-panel" style={{ borderColor: `${color}44` }}>
            <div className="vis-info-row">
              <span>Frame</span><code>{frame}/{calls.length}</code>
            </div>
            <div className="vis-info-row">
              <span>Stack depth</span><code>{callStack.length}</code>
            </div>
            {frame === calls.length && (
              <div className="vis-info-row" style={{ color }}>
                <span>Result</span><code style={{ color }}>{calls[calls.length-1]?.val}</code>
              </div>
            )}
          </div>
          <div className="base-case-note" style={{ borderColor: `${color}33` }}>
            <span className="section-label">Base Case</span>
            <code style={{ color }}>fib(0) = 0, fib(1) = 1</code>
          </div>
        </div>
      </div>

      {canInteract && (
        <div className="vis-controls">
          <div className="vis-control-row">
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>fib(</span>
            <input
              className="input"
              type="number"
              min={2}
              max={6}
              value={n}
              style={{ maxWidth: 60 }}
              onChange={e => { setN(Number(e.target.value)); reset(); }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>)</span>
            <button className="btn btn-outline btn-sm" onClick={play} disabled={isPlaying} style={{ color }}>
              Animate
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setFrame(calls.length)}>Skip</button>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Reset</button>
          </div>
          <p className="vis-experiment-hint">Increase n to see exponential call growth (max 6 for performance).</p>
        </div>
      )}
    </div>
  );
}
