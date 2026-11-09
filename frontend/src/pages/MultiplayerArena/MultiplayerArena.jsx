import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Send, ArrowLeft, Lightbulb, CheckCircle2, XCircle, Coins, Zap } from 'lucide-react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import { runCode } from '../../utils/codeRunner';
import VoicePanel from '../../components/Battle/VoicePanel';
import TeamCombo from '../../components/Battle/TeamCombo';
import gsap from 'gsap';
import './MultiplayerArena.css';

export default function MultiplayerArena() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { socket, room, myTeam, teamHP, bossHP, submissions, comboEvent, typingUsers, matchResult, rateLimited, submitCode, sendTyping, voiceMuted, voiceSpeaking } = useMultiplayer();

  useEffect(() => { if (!room) navigate('/pvp', { replace: true }); }, [room, navigate]);

  const problem = room?.problem;
  const mode = room?.mode;
  const roomId = room?.roomId;

  const allPlayers = [
    ...(room?.teams?.A || []).map(p => ({ ...p, team: 'A' })),
    ...(room?.teams?.B || []).map(p => ({ ...p, team: 'B' })),
  ];
  const peerUserIds = allPlayers.filter(p => p.userId !== user?.id).map(p => p.userId);

  const { isMuted, toggleMute, speakingStates, voiceError, voiceEnabled, startVoice, remoteStreams } = useVoiceChat(socket, roomId, user?.id, peerUserIds);

  const [code, setCode] = useState('');
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState([]);
  const [combatLog, setCombatLog] = useState([]);
  const arenaRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (problem) setCode(problem.functionSignatures?.[selectedLang] || '');
  }, [problem, selectedLang]);

  const handleCodeChange = (val) => {
    setCode(val);
    sendTyping(roomId, true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTyping(roomId, false), 1500);
  };

  useEffect(() => {
    if (!submissions.length) return;
    const latest = submissions[submissions.length - 1];
    const id = Date.now();
    setFloatingDamage(prev => [...prev, { id, amount: latest.damage, team: latest.team }]);
    setTimeout(() => setFloatingDamage(prev => prev.filter(d => d.id !== id)), 1500);
    setCombatLog(prev => [{ id, text: `${latest.username} dealt ${latest.damage} dmg (${Math.round(latest.correctness * 100)}% correct)`, type: latest.team === myTeam ? 'ally' : 'enemy' }, ...prev.slice(0, 9)]);
    if (arenaRef.current && latest.team !== myTeam) {
      gsap.fromTo(arenaRef.current, { x: -4 }, { x: 4, duration: 0.04, repeat: 5, yoyo: true, onComplete: () => gsap.set(arenaRef.current, { x: 0 }) });
    }
  }, [submissions]); // eslint-disable-line

  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setRunResults(null);
    try {
      const results = await runCode(code, selectedLang, problem.testCases, user?.token);
      setRunResults(results);
    } catch (err) {
      setRunResults([{ error: err.message }]);
    } finally { setIsRunning(false); }
  };

  const handleSubmit = async () => {
    if (!problem || submitted) return;
    setIsSubmitting(true);
    try {
      const results = await runCode(code, selectedLang, problem.testCases, user?.token);
      setRunResults(results);
      setSubmitted(true);
      submitCode(roomId, results);
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const getLangExtension = () => {
    switch (selectedLang) {
      case 'python': return [python()];
      case 'java':   return [java()];
      case 'cpp':    return [cpp()];
      case 'c':      return [cpp()]; // C uses cpp highlighter
      default:       return [javascript()];
    }
  };

  const teamAHP = mode === 'duo' ? bossHP : (teamHP?.A ?? 1000);
  const teamBHP = (mode === '2v2' || mode === '1v1') ? (teamHP?.B ?? 1000) : 1000;
  const teamAMax = 1000;
  const teamBMax = 1000;
  const teamAPct = Math.max(0, (teamAHP / teamAMax) * 100);
  const teamBPct = Math.max(0, (teamBHP / teamBMax) * 100);

  const activeTypers = Object.entries(typingUsers).filter(([uid, typing]) => typing && uid !== user?.id).map(([uid]) => allPlayers.find(p => p.userId === uid)?.username || 'Teammate');

  if (!room || !problem) return <div className="mp-loading"><div className="mp-loading-spinner" /><span>Loading arena...</span></div>;

  return (
    <div className="mp-arena" ref={arenaRef}>
      <TeamCombo comboEvent={comboEvent} myTeam={myTeam} />

      <AnimatePresence>
        {matchResult && (
          <motion.div className="mp-end-modal" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
            <div className={`mp-end-card ${matchResult.winner === myTeam ? 'victory' : 'defeat'}`}>
              <div className="mp-end-title">{matchResult.disconnected ? '⚡ OPPONENT LEFT' : matchResult.winner === myTeam ? '🏆 VICTORY' : '💀 DEFEATED'}</div>
              {matchResult.loot && (
                <div className="mp-end-loot">
                  <div className="loot-row"><span>⭐ EXPERIENCE</span><span>+{matchResult.loot.xp} XP</span></div>
                  <div className="loot-row coins">
                    <span>💰 COINS {matchResult.winner === myTeam ? 'WON' : 'LOST'}</span>
                    <span className={matchResult.winner === myTeam ? 'loot-gain' : 'loot-loss'}>
                      {matchResult.winner === myTeam ? '+' : '-'}{matchResult.loot.coins} G
                    </span>
                  </div>
                  <div className="loot-row elo">
                    <span>📊 ELO RATING</span>
                    <span className={matchResult.winner === myTeam ? 'loot-gain' : 'loot-loss'}>
                      {matchResult.winner === myTeam ? '+' : '-'}{matchResult.loot.eloChange || 25} pts
                    </span>
                  </div>
                </div>
              )}
              <div className="mp-end-actions">
                <button className="mp-btn mp-btn-primary" onClick={() => navigate('/pvp')}>Play Again</button>
                <button className="mp-btn mp-btn-ghost" onClick={() => navigate('/')}>Return to Hub</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BATTLE HEADER */}
      <div className="mp-battle-header">
        <button className="mp-back-btn" onClick={() => navigate('/pvp')}><ArrowLeft size={14} /> Exit</button>
        <div className="mp-team mp-team-a">
          <div className="mp-team-players">
            {(room.teams?.A || []).map(p => (
              <div key={p.userId} className={`mp-player-chip ${p.userId === user?.id ? 'is-me' : ''}`}>
                <div className={`mp-player-avatar ${speakingStates[p.userId] ? 'speaking' : ''}`}>{(p.username || 'P')[0]}</div>
                <div>
                  <div className="mp-player-name">{p.userId === user?.id ? 'YOU' : p.username}</div>
                  {typingUsers[p.userId] && <div className="mp-typing-dot">typing...</div>}
                </div>
                {submitted && p.userId === user?.id && <CheckCircle2 size={12} className="text-green-400" />}
              </div>
            ))}
          </div>
          <div className="mp-hp-section">
            <div className="mp-hp-label"><span>{mode === 'duo' ? 'BOSS HP' : mode === '1v1' ? 'YOUR HP' : 'TEAM A'}</span><span>{teamAHP}/{teamAMax}</span></div>
            <div className="mp-hp-bar-wrap"><div className="mp-hp-bar mp-hp-a" style={{ width: `${teamAPct}%` }} /></div>
          </div>
        </div>
        <div className="mp-vs-center">
          <div className="mp-vs-badge">VS</div>
          <div className="mp-mode-label">{mode?.toUpperCase()}</div>
          <div className="mp-coin-stake">
            <span className="mp-coin-icon">💰</span>
            <span className="mp-coin-label">STAKE</span>
            <span className="mp-coin-val">{mode === '1v1' ? '120' : mode === '2v2' ? '200' : '150'} G</span>
          </div>
        </div>
        <div className="mp-team mp-team-b">
          <div className="mp-hp-section right">
            <div className="mp-hp-label"><span>{mode === 'duo' ? 'YOUR TEAM' : mode === '1v1' ? 'ENEMY HP' : 'TEAM B'}</span><span>{teamBHP}/{teamBMax}</span></div>
            <div className="mp-hp-bar-wrap right"><div className="mp-hp-bar mp-hp-b" style={{ width: `${teamBPct}%` }} /></div>
          </div>
          <div className="mp-team-players">
            {(mode === '2v2' || mode === '1v1') ? (room.teams?.B || []).map(p => (
              <div key={p.userId} className="mp-player-chip">
                <div className={`mp-player-avatar enemy ${speakingStates[p.userId] ? 'speaking' : ''}`}>{(p.username || 'P')[0]}</div>
                <div className="mp-player-name">{p.username}</div>
              </div>
            )) : <div className="mp-player-chip"><div className="mp-player-avatar enemy">👾</div><div className="mp-player-name">BOSS</div></div>}
          </div>
        </div>
      </div>

      {/* MAIN BODY */}
      <div className="mp-body">
        <div className="mp-left">
          <div className="mp-problem-scroll">
            <div className="mp-problem-header">
              <div><span className="mp-problem-region">{problem.difficulty}</span><h2 className="mp-problem-title">{problem.title}</h2></div>
              <span className={`mp-diff-badge diff-${(problem.difficulty || 'medium').toLowerCase()}`}>{problem.difficulty}</span>
            </div>
            <div className="mp-problem-mission">
              {problem.mission?.split('\n').map((line, i) => line.trim() ? <p key={i}>{line.trim()}</p> : <div key={i} style={{ height: 8 }} />)}
            </div>
            <div className="mp-problem-examples">
              <span className="mp-section-label">Test Cases</span>
              {(problem.testCases || []).map((tc, i) => (
                <div key={i} className="mp-example">
                  <div className="mp-example-row"><span>Input</span><code>{JSON.stringify(tc.input)}</code></div>
                  <div className="mp-example-row"><span>Output</span><code>{JSON.stringify(tc.expected)}</code></div>
                </div>
              ))}
            </div>
            <button className={`mp-hint-toggle ${showHint ? 'active' : ''}`} onClick={() => setShowHint(v => !v)}><Lightbulb size={13} /> {showHint ? 'Hide Hint' : 'Show Hint'}</button>
            {showHint && <div className="mp-hint-body"><p>{problem.hint}</p></div>}
            <div className="mp-combat-log">
              <span className="mp-section-label">Combat Log</span>
              {combatLog.length === 0 && <div className="mp-log-empty">No events yet...</div>}
              {combatLog.map(entry => <div key={entry.id} className={`mp-log-entry ${entry.type}`}>{entry.type === 'ally' ? '⚡' : '💥'} {entry.text}</div>)}
            </div>
          </div>
        </div>

        <div className="mp-right">
          <div className="mp-editor-section">
            <div className="mp-editor-toolbar">
              <div className="mp-editor-left">
                <span className="mp-section-label">YOUR CODE</span>
                <select className="mp-lang-select" value={selectedLang} onChange={e => setSelectedLang(e.target.value)}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </div>
              <div className="mp-editor-right">
                <button className="mp-btn mp-btn-outline mp-btn-sm" onClick={handleRun} disabled={isRunning}><Play size={13} /> {isRunning ? 'Running...' : 'Run'}</button>
                <button className="mp-btn mp-btn-primary mp-btn-sm" onClick={handleSubmit} disabled={isSubmitting || submitted}><Send size={13} />{submitted ? 'Submitted ✓' : isSubmitting ? 'Submitting...' : 'Submit'}</button>
              </div>
            </div>
            <div className="mp-editor-body">
              <CodeMirror value={code} onChange={handleCodeChange} extensions={getLangExtension()} theme={oneDark} height="100%" style={{ height: '100%' }} basicSetup={{ lineNumbers: true, autocompletion: true }} />
            </div>
          </div>
          {runResults && (
            <div className="mp-results">
              <div className="mp-results-header">
                <span className="mp-section-label">Results</span>
                <span className={`mp-results-summary ${runResults.every(r => r.passed) ? 'pass' : 'fail'}`}>{runResults.filter(r => r.passed).length}/{runResults.length} passed</span>
              </div>
              {runResults.map((r, i) => (
                <div key={i} className={`mp-result-row ${r.passed ? 'pass' : 'fail'}`}>
                  {r.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>Case {i + 1}</span>
                  {r.error && <code className="mp-result-error">{r.error}</code>}
                  {!r.error && !r.passed && <code className="mp-result-got">Got: {String(r.actual)}</code>}
                </div>
              ))}
            </div>
          )}
          <AnimatePresence>
            {rateLimited && (
              <motion.div className="mp-rate-limit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>⏱ {rateLimited}</motion.div>
            )}
          </AnimatePresence>
          {activeTypers.length > 0 && (
            <div className="mp-teammate-section">
              <div className="mp-editor-toolbar"><span className="mp-section-label">{activeTypers[0]} is typing...</span></div>
              <div className="mp-teammate-placeholder"><div className="mp-typing-indicator"><span /><span /><span /></div></div>
            </div>
          )}
        </div>
      </div>

      <VoicePanel players={allPlayers} myUserId={user?.id} isMuted={isMuted} toggleMute={toggleMute} speakingStates={speakingStates} voiceMuted={voiceMuted} voiceEnabled={voiceEnabled} voiceError={voiceError} startVoice={startVoice} remoteStreams={remoteStreams} />

      <AnimatePresence>
        {floatingDamage.map(dmg => (
          <motion.div key={dmg.id} className={`mp-floating-dmg ${dmg.team === myTeam ? 'ally' : 'enemy'}`} initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -80, scale: 1.4 }} exit={{ opacity: 0, scale: 2 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
            -{dmg.amount}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
