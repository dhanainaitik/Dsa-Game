import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Send, Plus, ChevronDown, ChevronUp, Lightbulb, CheckCircle2, XCircle, AlertCircle, Shield, Zap, Backpack } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { motion, AnimatePresence } from 'framer-motion';
import { getProblem, getState } from '../../data/problems';
import { getRegionById } from '../../data/regions';
import { getEnemyForProblem } from '../../data/enemies';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { runCode } from '../../utils/codeRunner';
import gsap from 'gsap';
import AICompanion from '../../components/Battle/AICompanion';

import charNormalImg from '../../../charcters/char/char.png';
import charDamagedImg from '../../../charcters/char/damged char.png';
import goblinNormalImg from '../../../charcters/goblin/goblin.png';
import goblinDamagedImg from '../../../charcters/goblin/damaged.png';

import './Question.css';

const DIFFICULTY_LABELS = {
  Easy: 'easy',
  'Easy-Medium': 'easy',
  Medium: 'medium',
  'Medium-Hard': 'medium',
  Hard: 'hard',
};

export default function Question() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const problem = getProblem(problemId);
  const { progress, markSolved, calculateRewards } = useProgress();

  const [selectedLang, setSelectedLang] = useState('javascript');
  const [codesByLanguage, setCodesByLanguage] = useState({});
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState(problem?.testCases || []);
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);

  const { user } = useAuth();
  const { isDark } = useTheme();

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [customInput, setCustomInput] = useState('');
  const [customExpected, setCustomExpected] = useState('');
  const [showAddCase, setShowAddCase] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // V3 Battle State
  const enemy = getEnemyForProblem(problem?.regionId, problem?.difficulty);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(enemy?.baseHp || 500);
  const [combatText, setCombatText] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [floatingDamage, setFloatingDamage] = useState([]);
  const [showCompanion, setShowCompanion] = useState(false);
  const [damageDealt, setDamageDealt] = useState(0);

  // Inventory & Magic Items
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [activeItems, setActiveItems] = useState({});

  useEffect(() => {
    if (user?.getToken) {
      user.getToken().then(token => {
        fetch('/api/inventory', {
          headers: { 
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        })
        .then(res => res.json())
        .then(data => setInventory(data))
        .catch(err => console.error("Failed to load inventory", err));
      });
    }
  }, [user]);

  const handleUseItem = async (item) => {
    if (!user) return;
    
    // Example immediate effects
    if (item.items.slug === 'hint_scroll') {
      setShowHint(true);
      showCombatText('HINT REVEALED!', 'player-hit');
    } else if (item.items.slug === 'focus_charm') {
      setAttempts(0);
      showCombatText('ATTEMPTS RESET!', 'player-hit');
    } else if (item.items.slug === 'healing_potion') {
      setPlayerHP(100);
      showCombatText('+HP HEALED!', 'player-hit');
    } else {
      // Passive/Buff effect for next submission
      setActiveItems(prev => ({ ...prev, [item.items.slug]: true }));
      showCombatText(`${item.items.name.toUpperCase()} ACTIVATED!`, 'player-hit');
    }

    // Call backend to consume item
    try {
      const token = await user.getToken();
      await fetch('/api/inventory/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: item.item_id })
      });
      // Refresh inventory
      const res = await fetch('/api/inventory', {
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      setInventory(data);
    } catch (e) {
      console.error(e);
    }
    
    setShowInventory(false);
  };

  // Screen shake effect
  const triggerScreenShake = () => {
    const arena = document.querySelector('.battle-arena');
    if (!arena) return;
    gsap.fromTo(arena, 
      { x: -5 }, 
      { x: 5, duration: 0.05, repeat: 5, yoyo: true, onComplete: () => gsap.set(arena, { x: 0 }) }
    );
  };

  const spawnDamageNumber = (amount, side) => {
    const id = Date.now();
    setFloatingDamage(prev => [...prev, { id, amount, side }]);
    setTimeout(() => {
      setFloatingDamage(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };

  // Refs for WAAPI animations
  const enemyAvatarRef = useRef(null);
  const playerHpBarRef = useRef(null);
  const enemyHpBarRef = useRef(null);

  // Sync code when language or problem changes
  useEffect(() => {
    if (!problem) return;
    
    const savedCode = codesByLanguage[selectedLang];
    if (savedCode) {
      setCode(savedCode);
    } else {
      // Fallback to signature or legacy starterCode
      const initialCode = problem.functionSignatures?.[selectedLang] || problem.starterCode || '';
      setCode(initialCode);
      setCodesByLanguage(prev => ({ ...prev, [selectedLang]: initialCode }));
    }
  }, [selectedLang, problemId]);

  const handleCodeChange = (newVal) => {
    setCode(newVal);
    setCodesByLanguage(prev => ({ ...prev, [selectedLang]: newVal }));
  };

  // Enemy idle float animation
  useEffect(() => {
    const el = enemyAvatarRef.current;
    if (!el) return;
    const anim = el.animate(
      [
        { transform: 'translateY(0px)' },
        { transform: 'translateY(-8px)' },
        { transform: 'translateY(0px)' },
      ],
      { duration: 3200, iterations: Infinity, easing: 'ease-in-out' }
    );
    return () => anim.cancel();
  }, []);

  // HP bar flash when hit
  const flashHpBar = (ref, color) => {
    if (!ref.current) return;
    ref.current.animate(
      [
        { opacity: 1 },
        { opacity: 0.3 },
        { opacity: 1 },
        { opacity: 0.3 },
        { opacity: 1 },
      ],
      { duration: 500, easing: 'ease-out' }
    );
  };

  const showCombatText = (text, type) => {
    setCombatText({ text, type, id: Date.now() });
    setTimeout(() => setCombatText(null), 1600);
  };

  if (!problem || !enemy) {
    return (
      <div className="page">
        <div className="container page-content">
          <p>Problem or Enemy not found.</p>
        </div>
      </div>
    );
  }

  const state = getState(problem.stateId);
  const region = getRegionById(problem.regionId);
  const alreadySolved = !!progress.solvedProblems[problemId];
  const diffClass = DIFFICULTY_LABELS[problem.difficulty] || 'medium';

  const playerHpPct = Math.max(0, (playerHP / 100) * 100);
  const enemyHpPct = Math.max(0, (enemyHP / enemy.baseHp) * 100);

  const handleRun = async () => {
    setIsRunning(true);
    setSubmitResult(null);
    setAttempts(a => a + 1);

    try {
      // runCode is now async and handles remote execution for non-JS languages
      const token = await user?.getToken();
      const results = await runCode(code, selectedLang, testCases, token);
      setRunResults(results);
      setPanelOpen(true);
      
      const passedCount = results.filter(r => r.passed).length;
      if (passedCount === results.length) {
        showCombatText('DRY RUN — O.K.', 'player-hit');
      } else {
        showCombatText('RUN FAILED', 'enemy-hit');
      }
    } catch (err) {
      console.error(err);
      showCombatText('ENGINE ERROR', 'enemy-hit');
      setRunResults([{ error: err.message }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setRunResults(null);
    setAiFeedback(null);
    setShowCompanion(false);

    try {
      const token = await user.getToken();
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language: selectedLang,
          context: {
            title: problem.title,
            description: problem.mission,
            testCases: problem.testCases
          }
        }),
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const result = await response.json();
      setSubmitResult({ 
        results: result.results || [], 
        allPassed: result.passed 
      });
      setAiFeedback(result);
      setPanelOpen(true);
      setShowCompanion(true);

      // Damage Calculation
      const tcResults = result.results || [];
      const passedCount = tcResults.filter(tc => tc.passed).length;
      const totalCount = Math.max(tcResults.length, testCases.length, 1);
      const correctness = passedCount / totalCount;
      
      const playerBasePower = 50 * (progress?.level || 1);
      
      let damage = 0;
      if (correctness === 1) {
        damage = enemyHP; // instant kill, cap at remaining HP
      } else {
        damage = Math.floor(correctness * playerBasePower);
        damage = Math.min(enemyHP, damage);
      }
      damage = Math.max(0, damage);
      
      if (correctness === 1) {
        // Critical Strike / Full Success
        gsap.to({}, { duration: 0, onStart: triggerScreenShake });
        showCombatText('CRITICAL STRIKE!', 'player-hit');
        if (damage > 0) spawnDamageNumber(damage, 'enemy');
        setEnemyHP(prev => Math.max(0, prev - damage));
        flashHpBar(enemyHpBarRef, 'red');

        if (!alreadySolved) {
          markSolved(problemId, problem.stateId, problem.difficulty, Math.max(1, attempts));
        }
      } else if (correctness > 0) {
        // Partial Success
        showCombatText('HIT!', 'player-hit');
        if (damage > 0) spawnDamageNumber(damage, 'enemy');
        setEnemyHP(prev => Math.max(0, prev - damage));
        flashHpBar(enemyHpBarRef, 'orange');
        
        // Enemy counters
        setTimeout(() => {
          let enemyDamage = Math.floor((1 - correctness) * (enemy.baseAttack || 20));
          if (activeItems.retry_shield) {
            enemyDamage = 0;
            showCombatText('BLOCKED!', 'player-hit');
            setActiveItems(prev => ({ ...prev, retry_shield: false }));
          }
          enemyDamage = Math.max(0, enemyDamage);
          if (enemyDamage > 0) {
            setPlayerHP(prev => Math.max(0, prev - enemyDamage));
            spawnDamageNumber(enemyDamage, 'player');
            flashHpBar(playerHpBarRef, 'green');
          }
        }, 1000);
      } else {
        // Failure
        showCombatText('FAILED!', 'enemy-hit');
        triggerScreenShake();
        let enemyDamage = Math.floor((1 - correctness) * (enemy.baseAttack || 20));
        if (activeItems.retry_shield) {
            enemyDamage = 0;
            showCombatText('BLOCKED!', 'player-hit');
            setActiveItems(prev => ({ ...prev, retry_shield: false }));
        }
        enemyDamage = Math.max(0, enemyDamage);
        if (enemyDamage > 0) {
          setPlayerHP(prev => Math.max(0, prev - enemyDamage));
          spawnDamageNumber(enemyDamage, 'player');
          flashHpBar(playerHpBarRef, 'green');
        }
      }

    } catch (err) {
      console.error(err);
      showCombatText('ERROR!', 'enemy-hit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLangExtension = () => {
    switch (selectedLang) {
      case 'python': return [python()];
      case 'java': return [java()];
      case 'cpp': return [cpp()];
      case 'c': return [cpp()];
      default: return [javascript()];
    }
  };

  const addCustomCase = () => {
    if (!customInput.trim()) return;
    
    let parsedInput;
    try {
      // Try to parse input if it looks like JSON (array or object)
      parsedInput = JSON.parse(customInput);
    } catch {
      // Fallback to raw string
      parsedInput = customInput;
    }

    setTestCases(prev => [
      ...prev, 
      { input: parsedInput, expected: customExpected || '?' }
    ]);
    setCustomInput('');
    setCustomExpected('');
    setShowAddCase(false);
  };

  const allSubmitPassed = submitResult?.allPassed;

  return (
    <div className="question-layout">

      {/* BATTLE ARENA — TOP */}
      <div className="battle-arena">
        <button className="brutalist-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> BACK
        </button>

        <div className="battle-ground">
          {/* Enemy Side */}
          <div className="battle-entity enemy-side">
            <div className="battle-hud enemy-hud">
              <div className="hud-header">
                <span className="hud-name">{enemy.name}</span>
                <span className="hud-level">Lv: 3</span>
              </div>
              <div className="hud-hp-row">
                <span className="hp-label">HP</span>
                <div className="hp-bar-wrap">
                  <div
                    ref={enemyHpBarRef}
                    className="hp-bar enemy-hp"
                    style={{ width: `${enemyHpPct}%`, backgroundColor: enemy.color || '#22C55E' }}
                  />
                </div>
              </div>
            </div>
            
            <div ref={enemyAvatarRef} className="battle-sprite-container enemy-sprite">
              <img src={(enemy.id === 'goblin' || enemy.id === 'phantom_goblin' || true) ? (enemyHP > 0 ? goblinNormalImg : goblinDamagedImg) : goblinNormalImg} alt={enemy.name} />
            </div>

            <AnimatePresence>
              {combatText && combatText.type === 'player-hit' && (
                <motion.div
                  key={combatText.id}
                  className="combat-float attack"
                  initial={{ opacity: 0, scale: 0.6, rotate: 10 }}
                  animate={{ opacity: 1, scale: 1.15, rotate: -6, y: -24 }}
                  exit={{ opacity: 0, scale: 0.8, y: -48 }}
                  transition={{ duration: 0.65, ease: 'backOut' }}
                >
                  {combatText.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Player Side */}
          <div className="battle-entity player-side">
            <div className="battle-sprite-container player-sprite">
              <img src={playerHP > 20 ? charNormalImg : charDamagedImg} alt="Player" />
            </div>

            <div className="battle-hud player-hud">
              <div className="hud-header">
                <span className="hud-name">CODER</span>
                <span className="hud-level">Lv: {progress.level || 6}</span>
              </div>
              <div className="hud-hp-row">
                <span className="hp-label">HP</span>
                <div className="hp-bar-wrap">
                  <div
                    ref={playerHpBarRef}
                    className="hp-bar player-hp"
                    style={{ width: `${playerHpPct}%` }}
                  />
                </div>
              </div>
              <div className="hud-hp-text">{playerHP} / 100</div>
              <div className="hud-exp-row">
                <span className="exp-label">EXP</span>
                <div className="exp-bar-wrap"><div className="exp-bar" style={{width: '60%'}}></div></div>
              </div>
            </div>

            <AnimatePresence>
              {combatText && combatText.type === 'enemy-hit' && (
                <motion.div
                  key={combatText.id}
                  className="combat-float damage"
                  initial={{ opacity: 0, y: 0, scale: 0.7 }}
                  animate={{ opacity: 1, y: -40, scale: 1.1 }}
                  exit={{ opacity: 0, y: -70, scale: 0.9 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  {combatText.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CODE SECTION — BOTTOM */}
      <div className="question-body v3-bottom">

        {/* Left: Description */}
        <div className="question-left">
          <div className="question-desc-scroll">
            <div className="mission-header">
              <span className="target-label">TARGET — {enemy.name.toUpperCase()}</span>
              <h2 className="mission-title">{problem.title.toUpperCase()}</h2>
              <span className={`badge badge-${diffClass}`}>{problem.difficulty.toUpperCase()}</span>
            </div>

            <div className="mission-body" style={{ marginTop: 8 }}>
              {problem.mission.split('\n').map((line, i) =>
                line.trim()
                  ? <p key={i} className="mission-line">{line.trim()}</p>
                  : <div key={i} style={{ height: 8 }} />
              )}
            </div>

            <hr className="divider" />

            <div className="desc-section">
              <span className="section-label">Examples</span>
              <div className="examples-list">
                {problem.testCases.map((tc, i) => (
                  <div key={i} className="example-block">
                    <div className="example-row">
                      <span className="example-label">Input</span>
                      <code className="example-value">{tc.input}</code>
                    </div>
                    <div className="example-row">
                      <span className="example-label">Output</span>
                      <code className="example-value">{tc.expected}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hint-section">
              <button
                className={`hint-toggle ${showHint ? 'active' : ''}`}
                onClick={() => setShowHint(v => !v)}
              >
                <Lightbulb size={14} />
                <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                {showHint ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    className="hint-body"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p>{problem.hint}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {alreadySolved && (
              <motion.div
                className="explanation-section animate-fadeIn"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="section-label" style={{ color: enemy.color }}>Codex Entry</span>
                <p className="explanation-text" style={{ marginTop: 8 }}>
                  <i>{enemy.lore}</i><br /><br />{problem.explanation}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right: Editor + Test Cases */}
        <div className="question-right">
          <div className="editor-container">
            {/* Editor Toolbar */}
            <div className="editor-toolbar">
              <div className="editor-toolbar-left">
                <span className="section-label">Code</span>
                <select
                  className="comic-select"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </div>
              <div className="editor-toolbar-right">
                <button
                  className="btn-brutalist"
                  onClick={() => setShowInventory(v => !v)}
                  title="Bag / Magic Items"
                >
                  <Backpack size={14} /> BAG
                </button>
                <button
                  className="btn-brutalist"
                  onClick={handleRun}
                  disabled={isRunning || playerHP <= 0}
                >
                  <Play size={14} />
                  {isRunning ? 'RUNNING' : 'RUN'}
                </button>
                <button
                  className="btn-brutalist primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || playerHP <= 0}
                >
                  <Send size={14} />
                  {isSubmitting ? 'SUBMITTING' : 'SUBMIT'}
                </button>
              </div>
            </div>

            {/* Inventory Drawer */}
            <AnimatePresence>
              {showInventory && (
                <motion.div 
                  className="inventory-drawer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="inventory-header">
                    <span className="section-label">Magic Items</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowInventory(false)}>Close</button>
                  </div>
                  {inventory.length === 0 ? (
                    <div className="inventory-empty">Your bag is empty. Visit the Shop to buy items!</div>
                  ) : (
                    <div className="inventory-grid">
                      {inventory.map((invItem) => (
                        <div key={invItem.id} className="inv-item-card neo-border" onClick={() => handleUseItem(invItem)}>
                          <div className="inv-item-icon">{invItem.items?.icon || '📦'}</div>
                          <div className="inv-item-info">
                            <div className="inv-item-name">{invItem.items?.name}</div>
                            <div className="inv-item-qty">x{invItem.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code Editor */}
            <div className="editor-body">
              <CodeMirror
                value={code}
                onChange={handleCodeChange}
                extensions={getLangExtension()}
                theme={isDark ? oneDark : EditorView.theme({}, { dark: false })}
                height="100%"
                style={{ height: '100%' }}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                  autocompletion: true,
                  bracketMatching: true,
                }}
              />
            </div>
          </div>

          {/* Test Case Panel */}
          <div className={`testcase-panel ${panelOpen ? 'open' : 'closed'}`}>
            <div className="testcase-panel-header" onClick={() => setPanelOpen(v => !v)}>
              <span className="section-label">Test Cases</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {runResults && (
                  <span className="run-summary">
                    {runResults.filter(r => r.passed).length} / {runResults.length} passed
                  </span>
                )}
                {panelOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </div>
            </div>

            <AnimatePresence>
              {panelOpen && (
                <motion.div
                  className="testcase-panel-body"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Submit result banner */}
                  {submitResult && (
                    <div className={`submit-banner ${allSubmitPassed ? 'pass' : 'fail'} animate-scaleIn`}>
                      {allSubmitPassed ? (
                        <>
                          <CheckCircle2 size={18} />
                          <div>
                            <div className="submit-banner-title">Victory</div>
                            <div className="submit-banner-sub">{aiFeedback?.feedback || `Enemy ${enemy.name} defeated.`}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle size={18} />
                          <div>
                            <div className="submit-banner-title">Mission Failed</div>
                            <div className="submit-banner-sub">{aiFeedback?.feedback || 'Check your logic and try again.'}</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* AI Feedback */}
                  {aiFeedback && (
                    <div className="ai-feedback-box animate-fadeIn">
                      <div className="ai-feedback-header">
                        <Shield size={16} />
                        <span>System Analysis</span>
                        <div className="complexity-badges">
                          <span className="badge-outline">Time: {aiFeedback.complexity?.time}</span>
                          <span className="badge-outline">Space: {aiFeedback.complexity?.space}</span>
                        </div>
                      </div>
                      <p className="ai-details">{aiFeedback.details}</p>
                      {aiFeedback.suggestions?.length > 0 && (
                        <div className="ai-suggestions">
                          <span className="suggestion-label">Suggestions</span>
                          <ul>
                            {aiFeedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Player Defeated */}
                  {playerHP <= 0 && (
                    <div className="submit-banner fail animate-scaleIn" style={{ borderColor: 'var(--hard)' }}>
                      <AlertCircle size={18} color="var(--hard)" />
                      <div>
                        <div className="submit-banner-title" style={{ color: 'var(--hard)' }}>Defeated</div>
                        <div className="submit-banner-sub">
                          HP reached zero.{' '}
                          <a href="#" onClick={(e) => { e.preventDefault(); setPlayerHP(100); }}>Retry</a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Individual Results */}
                  {(runResults || submitResult?.results)?.map((result, i) => (
                    <div key={i} className={`tc-result ${result.passed ? 'pass' : result.error ? 'error' : 'fail'}`}>
                      <div className="tc-result-header">
                        <div className="tc-result-index">
                          {result.passed
                            ? <CheckCircle2 size={14} color="var(--success)" />
                            : result.error
                            ? <AlertCircle size={14} color="var(--hard)" />
                            : <XCircle size={14} color="var(--hard)" />
                          }
                          <span>Case {i + 1}</span>
                          {result.duration && <span className="tc-duration">{result.duration}ms</span>}
                        </div>
                      </div>
                      <div className="tc-result-body">
                        <div className="tc-row">
                          <span className="tc-label">Input</span>
                          <code className="tc-value">{result.input}</code>
                        </div>
                        <div className="tc-row">
                          <span className="tc-label">Expected</span>
                          <code className="tc-value">{result.expected}</code>
                        </div>
                        <div className="tc-row">
                          <span className="tc-label">Got</span>
                          <code className={`tc-value ${result.passed ? 'correct' : 'wrong'}`}>
                            {result.error || result.actual}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {!runResults && !submitResult && (
                    <div className="tc-empty">Run or submit code to see results.</div>
                  )}

                  {/* Test Cases List */}
                  <div className="tc-list">
                    <div className="tc-list-header">
                      <span className="section-label">Test Cases ({testCases.length})</span>
                      <button className="btn-brutalist" onClick={() => setShowAddCase(v => !v)}>
                        <Plus size={13} /> ADD
                      </button>
                    </div>

                    {testCases.map((tc, i) => (
                      <div key={i} className="tc-item">
                        <span className="tc-item-num">{i + 1}</span>
                        <code className="tc-item-input">{tc.input}</code>
                        <span className="tc-item-arrow">→</span>
                        <code className="tc-item-expected">{tc.expected}</code>
                      </div>
                    ))}

                    {showAddCase && (
                      <div className="add-case-form animate-fadeIn">
                        <input
                          className="input"
                          placeholder="Input (e.g. [1,2,3])"
                          value={customInput}
                          onChange={e => setCustomInput(e.target.value)}
                        />
                        <input
                          className="input"
                          placeholder="Expected output"
                          value={customExpected}
                          onChange={e => setCustomExpected(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-brutalist primary" onClick={addCustomCase}>ADD</button>
                          <button className="btn-brutalist" onClick={() => setShowAddCase(false)}>CANCEL</button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* AI COMPANION */}
      <AICompanion 
        isVisible={showCompanion} 
        feedback={aiFeedback?.feedback}
        nextStep={aiFeedback?.next_step}
      />

      {/* FLOATING DAMAGE NUMBERS */}
      <AnimatePresence>
        {floatingDamage.map(dmg => (
          <motion.div
            key={dmg.id}
            className={`floating-dmg ${dmg.side}`}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            -{dmg.amount}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
