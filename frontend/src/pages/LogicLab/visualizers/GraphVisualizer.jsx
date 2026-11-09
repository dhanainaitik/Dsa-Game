import { useState } from 'react';
import './Visualizer.css';

const GRAPH = {
  nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
  edges: [['A','B'],['A','C'],['B','D'],['C','D'],['C','E'],['D','F'],['E','F']],
  adj: { A:['B','C'], B:['A','D'], C:['A','D','E'], D:['B','C','F'], E:['C','F'], F:['D','E'] },
};

const POSITIONS = {
  A: { x: 50, y: 15 },
  B: { x: 20, y: 45 },
  C: { x: 80, y: 45 },
  D: { x: 20, y: 75 },
  E: { x: 80, y: 75 },
  F: { x: 50, y: 95 },
};

export default function GraphVisualizer({ step, color, readonly }) {
  const [visited, setVisited] = useState([]);
  const [active, setActive] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const canInteract = step >= 1 && !readonly;

  const bfs = (start) => {
    setIsRunning(true);
    setVisited([]);
    const queue = [start];
    const seen = new Set([start]);
    const order = [start];
    while (queue.length) {
      const node = queue.shift();
      for (const nb of GRAPH.adj[node]) {
        if (!seen.has(nb)) { seen.add(nb); queue.push(nb); order.push(nb); }
      }
    }
    order.forEach((node, i) => {
      setTimeout(() => setVisited(prev => [...prev, node]), i * 400);
    });
    setTimeout(() => setIsRunning(false), order.length * 400 + 200);
  };

  const reset = () => { setVisited([]); setActive(null); setIsRunning(false); };

  return (
    <div className="visualizer">
      <div className="vis-label">Graph — {GRAPH.nodes.length} vertices, {GRAPH.edges.length} edges (undirected)</div>

      <div className="graph-vis-wrapper">
        <svg viewBox="0 0 100 110" className="graph-svg">
          {/* Edges */}
          {GRAPH.edges.map(([a, b], i) => (
            <line
              key={i}
              x1={POSITIONS[a].x} y1={POSITIONS[a].y}
              x2={POSITIONS[b].x} y2={POSITIONS[b].y}
              className="graph-edge"
              style={{
                stroke: (visited.includes(a) && visited.includes(b)) ? color : undefined,
                opacity: (visited.includes(a) && visited.includes(b)) ? 0.8 : 0.25,
              }}
            />
          ))}

          {/* Nodes */}
          {GRAPH.nodes.map(node => {
            const pos = POSITIONS[node];
            const isVisited = visited.includes(node);
            const isActive = active === node;

            return (
              <g key={node} onClick={() => canInteract && !isRunning && setActive(isActive ? null : node)}>
                <circle
                  cx={pos.x} cy={pos.y} r={6}
                  className="graph-node"
                  fill={isVisited ? color : 'var(--bg-elevated)'}
                  stroke={isActive ? '#fff' : isVisited ? color : 'var(--border-light)'}
                  strokeWidth={isActive ? 1.5 : 1}
                  style={{ cursor: canInteract ? 'pointer' : 'default', transition: 'fill 300ms ease, stroke 300ms ease' }}
                />
                <text
                  x={pos.x} y={pos.y + 4}
                  textAnchor="middle"
                  fontSize="5"
                  fill={isVisited ? '#fff' : 'var(--text-secondary)'}
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                >
                  {node}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {active && (
        <div className="vis-info-panel" style={{ borderColor: `${color}44` }}>
          <div className="vis-info-row"><span>Node</span><code>{active}</code></div>
          <div className="vis-info-row"><span>Neighbors</span><code>[{GRAPH.adj[active].join(', ')}]</code></div>
          <div className="vis-info-row"><span>Degree</span><code>{GRAPH.adj[active].length}</code></div>
        </div>
      )}

      {canInteract && (
        <div className="vis-controls">
          <div className="vis-control-row">
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>BFS from:</span>
            {GRAPH.nodes.map(n => (
              <button
                key={n}
                className="btn btn-outline btn-sm"
                onClick={() => bfs(n)}
                disabled={isRunning}
                style={{ color }}
              >
                {n}
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={reset}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
