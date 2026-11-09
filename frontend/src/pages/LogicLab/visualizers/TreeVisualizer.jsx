import { useState } from 'react';
import './Visualizer.css';

// Simple binary tree root
const INIT_TREE = {
  val: 50,
  left: { val: 30, left: { val: 20, left: null, right: null }, right: { val: 40, left: null, right: null } },
  right: { val: 70, left: { val: 60, left: null, right: null }, right: { val: 80, left: null, right: null } },
};

function TreeNode({ node, color, active, setActive, depth = 0, canInteract }) {
  if (!node) return null;
  const isActive = active === node.val;

  return (
    <div className="tree-node-wrapper">
      <div
        className={`tree-node ${isActive ? 'active' : ''}`}
        style={{
          '--node-color': color,
          borderColor: isActive ? color : undefined,
          boxShadow: isActive ? `0 0 14px ${color}55` : undefined,
        }}
        onClick={() => canInteract && setActive(isActive ? null : node.val)}
      >
        {node.val}
      </div>

      {(node.left || node.right) && (
        <div className="tree-children">
          <div className="tree-child">
            {node.left
              ? <TreeNode node={node.left} color={color} active={active} setActive={setActive} depth={depth + 1} canInteract={canInteract} />
              : <div className="tree-null">null</div>
            }
          </div>
          <div className="tree-child">
            {node.right
              ? <TreeNode node={node.right} color={color} active={active} setActive={setActive} depth={depth + 1} canInteract={canInteract} />
              : <div className="tree-null">null</div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

function getInorder(node, result = []) {
  if (!node) return result;
  getInorder(node.left, result);
  result.push(node.val);
  getInorder(node.right, result);
  return result;
}

export default function TreeVisualizer({ step, color, readonly }) {
  const [active, setActive] = useState(null);
  const [traversalResult, setTraversalResult] = useState(null);
  const canInteract = step >= 1 && !readonly;

  return (
    <div className="visualizer">
      <div className="vis-label">Binary Search Tree — left &lt; root &lt; right</div>

      <div className="tree-vis-wrapper">
        <TreeNode
          node={INIT_TREE}
          color={color}
          active={active}
          setActive={setActive}
          canInteract={canInteract}
        />
      </div>

      {active !== null && (
        <div className="vis-info-panel" style={{ borderColor: `${color}44` }}>
          <div className="vis-info-row"><span>Node value</span><code>{active}</code></div>
          <div className="vis-info-row"><span>BST search: &lt; go left, &gt; go right</span></div>
          <div className="vis-info-row"><span>Search this node</span><code>O(log n)</code></div>
        </div>
      )}

      {traversalResult && (
        <div className="vis-traversal-result" style={{ borderColor: `${color}44` }}>
          <span className="vis-traversal-label">Inorder traversal →</span>
          <div className="vis-traversal-values">
            {traversalResult.map((v, i) => (
              <code key={i} className="traversal-val" style={{ color }}>{v}</code>
            ))}
          </div>
        </div>
      )}

      {canInteract && (
        <div className="vis-controls">
          <div className="vis-control-row">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setTraversalResult(getInorder(INIT_TREE))}
              style={{ color }}
            >
              Inorder Traversal
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setActive(null); setTraversalResult(null); }}>
              Reset
            </button>
          </div>
          <p className="vis-experiment-hint">Click nodes to inspect. Run traversal to see sorted output.</p>
        </div>
      )}
    </div>
  );
}
