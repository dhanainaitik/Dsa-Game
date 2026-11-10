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
import { Play, Send, ArrowLeft, Lightbulb, CheckCircle2, XCircle, Flame, Trophy, Crown, Sparkles, Skull } from 'lucide-react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import { useProgress } from '../../context/ProgressContext';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import { runCode } from '../../utils/codeRunner';
import { triggerGoblinDefeatEffects } from '../../utils/goblinEffects';
import VoicePanel from '../../components/Battle/VoicePanel';
import TeamCombo from '../../components/Battle/TeamCombo';
import MedalBadge from '../../components/Battle/MedalBadge';
import gsap from 'gsap';
import './BattleGroundArena.css';

export default function BattleGroundArena() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { progress, awardProblemCoins } = useProgress();
  const {
    socket,
    room,
    myTeam,
    teamHP,
    submissions,
    comboEvent,
    eliminatedEvent,
    typingUsers,
    matchResult,
    rateLimited,
    submitCode,
    sendTyping,
    voiceMuted,
    voiceSpeaking,
  } = useMultiplayer();

  useEffect(() => {
    if (!room) navigate('/pvp', { replace: true });
  }, [room, navigate]);

  const problem = room?.problem;
  const mode = room?.mode; // 'bg_1v1' or 'bg_2v2'
  const roomId = room?.roomId;

  const allPlayers = [
    ...(room?.teams?.A || []).map((p) => ({ ...p, team: 'A' })),
    ...(room?.teams?.B || []).map((p) => ({ ...p, team: 'B' })),
  ];
  const peerUserIds = allPlayers.filter((p) => p.userId !== user?.id).map((p) => p.userId);

  const {
    isMuted,
    toggleMute,
    speakingStates,
    voiceError,
    voiceEnabled,
    startVoice,
    remoteStreams,
  } = useVoiceChat(socket, roomId, user?.id, peerUserIds);

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
    setFloatingDamage((prev) => [...prev, { id, amount: latest.damage, team: latest.team }]);
    setTimeout(() => setFloatingDamage((prev) => prev.filter((d) => d.id !== id)), 1500);

    setCombatLog((prev) => [
      {
        id,
        text: `${latest.username} dealt ${latest.damage} critical dmg (${Math.round(latest.correctness * 100)}% passed)`,
        type: latest.team === myTeam ? 'ally' : 'enemy',
      },
      ...prev.slice(0, 9),
    ]);

    if (arenaRef.current && latest.team !== myTeam) {
      gsap.fromTo(
        arenaRef.current,
        { x: -6 },
        { x: 6, duration: 0.04, repeat: 7, yoyo: true, onComplete: () => gsap.set(arenaRef.current, { x: 0 }) }
      );
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
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem || submitted) return;
    setIsSubmitting(true);
    try {
      const results = await runCode(code, selectedLang, problem.testCases, user?.token);
      setRunResults(results);
      setSubmitted(true);
      submitCode(roomId, results);

      // Award +20 coins if all test cases pass on submission (first-time solve)
      const allPassed = Array.isArray(results) && results.length > 0 && results.every(r => r.passed);
      if (allPassed) {
        awardProblemCoins(`bg-${problem.id || problem.title}`, {
          problemTitle: problem.title,
          section: 'Battle Ground Arena',
        });
      } else {
        triggerGoblinDefeatEffects({ targetSelector: '.bg-arena' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLangExtension = () => {
    switch (selectedLang) {
      case 'python': return [python()];
      case 'java':   return [java()];
      case 'cpp':    return [cpp()];
      case 'c':      return [cpp()];
      default:       return [javascript()];
    }
  };

  const is2v2 = mode === 'bg_2v2';
  const teamAMax = is2v2 ? 2000 : 1000;
  const teamBMax = is2v2 ? 2000 : 1000;
  const teamAHP = teamHP?.A ?? teamAMax;
  const teamBHP = teamHP?.B ?? teamBMax;
  const teamAPct = Math.max(0, (teamAHP / teamAMax) * 100);
  const teamBPct = Math.max(0, (teamBHP / teamBMax) * 100);

  const activeTypers = Object.entries(typingUsers)
    .filter(([uid, typing]) => typing && uid !== user?.id)
    .map(([uid]) => allPlayers.find((p) => p.userId === uid)?.username || 'Teammate');

  if (!room || !problem) {
    return (
      <div className="bg-loading">
        <div className="bg-loading-spinner" />
        <span>Entering Battle Ground Arena...</span>
      </div>
    );
  }

  const isWinner = matchResult?.winner === myTeam;
  const myMedal = matchResult?.medals?.[user?.id] || (isWinner ? 'GOLD' : 'SILVER');

  return (
    <div className="bg-arena" ref={arenaRef}>
      <TeamCombo comboEvent={comboEvent} myTeam={myTeam} />

      {/* Elimination Banner Overlay */}
      <AnimatePresence>
        {eliminatedEvent && (
          <motion.div
            className="bg-elim-toast"
            initial={{ opacity: 0, scale: 0.7, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
          >
            <Skull size={24} className="bg-elim-icon" />
            <div className="bg-elim-text">{eliminatedEvent.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory / Defeat Medal Modal */}
      <AnimatePresence>
        {matchResult && (
          <motion.div
            className="bg-end-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <div className={`bg-end-card ${isWinner ? 'victory' : 'defeat'}`}>
              <div className="bg-end-sparkles">
                <Sparkles size={28} />
              </div>

              <div className="bg-end-title">
                {matchResult.disconnected
                  ? '⚡ OPPONENT FORFEIT'
                  : isWinner
                  ? '🏆 BATTLE GROUND CHAMPION'
                  : '💀 ELIMINATED'}
              </div>

              <div className="bg-end-medal-display">
                <div className={`medal-trophy-orb ${myMedal.toLowerCase()}`}>
                  <span className="trophy-emoji">{myMedal === 'GOLD' ? '🥇' : '🥈'}</span>
                </div>
                <div className="medal-title">
                  {myMedal === 'GOLD' ? 'GOLD MEDAL CLAIMED' : 'SILVER MEDAL SECURED'}
                </div>
                <p className="medal-sub">Added to your permanent Hunter profile</p>
              </div>

              {matchResult.loot && (
                <div className="bg-end-loot">
                  <div className="loot-row">
                    <span>⭐ TOURNAMENT XP</span>
                    <span>+{matchResult.loot.xp} XP</span>
                  </div>
                  <div className="loot-row coins">
                    <span>💰 COINS REWARD</span>
                    <span className="loot-gain">+{matchResult.loot.coins} G</span>
                  </div>
                  <div className="loot-row title">
                    <span>👑 TOURNAMENT TITLE</span>
                    <span className="loot-title">{matchResult.loot.title}</span>
                  </div>
                </div>
              )}

              <div className="bg-end-actions">
                <button className="bg-btn bg-btn-primary" onClick={() => navigate('/pvp')}>
                  Back to Lobby
                </button>
                <button className="bg-btn bg-btn-ghost" onClick={() => navigate('/dashboard')}>
                  View Profile & Medals
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BATTLE GROUND HEADER */}
      <div className="bg-battle-header">
        <button className="bg-back-btn" onClick={() => navigate('/pvp')}>
          <ArrowLeft size={14} /> Lobby
        </button>

        {/* TEAM A */}
        <div className="bg-team bg-team-a">
          <div className="bg-team-players">
            {(room.teams?.A || []).map((p) => (
              <div key={p.userId} className={`bg-player-chip ${p.userId === user?.id ? 'is-me' : ''}`}>
                <div className={`bg-player-avatar ${speakingStates[p.userId] ? 'speaking' : ''}`}>
                  {(p.username || 'P')[0]}
                </div>
                <div>
                  <div className="bg-player-name">{p.userId === user?.id ? 'YOU' : p.username}</div>
                  {typingUsers[p.userId] && <div className="bg-typing-dot">typing...</div>}
                </div>
                {submitted && p.userId === user?.id && <CheckCircle2 size={12} className="text-green-400" />}
              </div>
            ))}
          </div>
          <div className="bg-hp-section">
            <div className="bg-hp-label">
              <span>{is2v2 ? 'SQUAD A' : 'YOUR HP'}</span>
              <span>{teamAHP}/{teamAMax}</span>
            </div>
            <div className="bg-hp-bar-wrap">
              <div className="bg-hp-bar bg-hp-a" style={{ width: `${teamAPct}%` }} />
            </div>
          </div>
        </div>

        {/* CENTER TOURNAMENT BADGE */}
        <div className="bg-vs-center">
          <div className="bg-vs-badge">
            <Flame size={14} /> BATTLE GROUND
          </div>
          <div className="bg-mode-label">{mode === 'bg_2v2' ? '2v2 SQUAD ELIMINATION' : '1v1 DUEL TO THE DEATH'}</div>
          <div className="bg-prize-pool">
            <span className="bg-prize-icon">🏆</span>
            <span className="bg-prize-label">REWARD</span>
            <span className="bg-prize-val">🥇 GOLD MEDAL</span>
          </div>
        </div>

        {/* TEAM B */}
        <div className="bg-team bg-team-b">
          <div className="bg-hp-section right">
            <div className="bg-hp-label">
              <span>{is2v2 ? 'SQUAD B' : 'ENEMY HP'}</span>
              <span>{teamBHP}/{teamBMax}</span>
            </div>
            <div className="bg-hp-bar-wrap right">
              <div className="bg-hp-bar bg-hp-b" style={{ width: `${teamBPct}%` }} />
            </div>
          </div>
          <div className="bg-team-players">
            {(room.teams?.B || []).map((p) => (
              <div key={p.userId} className="bg-player-chip">
                <div className={`bg-player-avatar enemy ${speakingStates[p.userId] ? 'speaking' : ''}`}>
                  {(p.username || 'P')[0]}
                </div>
                <div className="bg-player-name">{p.username}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN BODY */}
      <div className="bg-body">
        {/* Left: Problem specification & combat log */}
        <div className="bg-left">
          <div className="bg-problem-scroll">
            <div className="bg-problem-header">
              <div>
                <span className="bg-problem-tournament-tag">APEX TOURNAMENT PROBLEM</span>
                <h2 className="bg-problem-title">{problem.title}</h2>
              </div>
              <span className="bg-diff-badge">{problem.difficulty}</span>
            </div>

            <div className="bg-problem-mission">
              {problem.mission?.split('\n').map((line, i) =>
                line.trim() ? <p key={i}>{line.trim()}</p> : <div key={i} style={{ height: 8 }} />
              )}
            </div>

            <div className="bg-problem-examples">
              <span className="bg-section-label">Verified Test Cases</span>
              {(problem.testCases || []).map((tc, i) => (
                <div key={i} className="bg-example">
                  <div className="bg-example-row">
                    <span>Input</span>
                    <code>{JSON.stringify(tc.input)}</code>
                  </div>
                  <div className="bg-example-row">
                    <span>Expected</span>
                    <code>{JSON.stringify(tc.expected)}</code>
                  </div>
                </div>
              ))}
            </div>

            {problem.hint && (
              <>
                <button
                  className={`bg-hint-toggle ${showHint ? 'active' : ''}`}
                  onClick={() => setShowHint((v) => !v)}
                >
                  <Lightbulb size={13} /> {showHint ? 'Hide Battle Hint' : 'Tactical Hint'}
                </button>
                {showHint && (
                  <div className="bg-hint-body">
                    <p>{problem.hint}</p>
                  </div>
                )}
              </>
            )}

            <div className="bg-combat-log">
              <span className="bg-section-label">Battle Log</span>
              {combatLog.length === 0 && <div className="bg-log-empty">Combat grid active. Awaiting submissions...</div>}
              {combatLog.map((entry) => (
                <div key={entry.id} className={`bg-log-entry ${entry.type}`}>
                  {entry.type === 'ally' ? '⚔️' : '💥'} {entry.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Code editor & test results */}
        <div className="bg-right">
          <div className="bg-editor-section">
            <div className="bg-editor-toolbar">
              <div className="bg-editor-left">
                <span className="bg-section-label">CODE ARENA</span>
                <select
                  className="bg-lang-select"
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
              <div className="bg-editor-right">
                <button
                  className="bg-btn bg-btn-outline bg-btn-sm"
                  onClick={handleRun}
                  disabled={isRunning}
                >
                  <Play size={13} /> {isRunning ? 'Testing...' : 'Run Tests'}
                </button>
                <button
                  className="bg-btn bg-btn-primary bg-btn-sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting || submitted}
                >
                  <Send size={13} />
                  {submitted ? 'Submitted ✓' : isSubmitting ? 'Striking...' : 'Submit Attack'}
                </button>
              </div>
            </div>

            <div className="bg-editor-body">
              <CodeMirror
                value={code}
                onChange={handleCodeChange}
                extensions={getLangExtension()}
                theme={oneDark}
                height="100%"
                style={{ height: '100%' }}
                basicSetup={{ lineNumbers: true, autocompletion: true }}
              />
            </div>
          </div>

          {runResults && (
            <div className="bg-results">
              <div className="bg-results-header">
                <span className="bg-section-label">Test Case Analysis</span>
                <span className={`bg-results-summary ${runResults.every((r) => r.passed) ? 'pass' : 'fail'}`}>
                  {runResults.filter((r) => r.passed).length}/{runResults.length} passed
                </span>
              </div>
              {runResults.map((r, i) => (
                <div key={i} className={`bg-result-row ${r.passed ? 'pass' : 'fail'}`}>
                  {r.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>Test {i + 1}</span>
                  {r.error && <code className="bg-result-error">{r.error}</code>}
                  {!r.error && !r.passed && <code className="bg-result-got">Output: {String(r.actual)}</code>}
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {rateLimited && (
              <motion.div
                className="bg-rate-limit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ⏱ {rateLimited}
              </motion.div>
            )}
          </AnimatePresence>

          {activeTypers.length > 0 && (
            <div className="bg-teammate-section">
              <div className="bg-editor-toolbar">
                <span className="bg-section-label">{activeTypers[0]} is coding attack...</span>
              </div>
              <div className="bg-teammate-placeholder">
                <div className="bg-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <VoicePanel
        players={allPlayers}
        myUserId={user?.id}
        isMuted={isMuted}
        toggleMute={toggleMute}
        speakingStates={speakingStates}
        voiceMuted={voiceMuted}
        voiceEnabled={voiceEnabled}
        voiceError={voiceError}
        startVoice={startVoice}
        remoteStreams={remoteStreams}
      />

      <AnimatePresence>
        {floatingDamage.map((dmg) => (
          <motion.div
            key={dmg.id}
            className={`bg-floating-dmg ${dmg.team === myTeam ? 'ally' : 'enemy'}`}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -90, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            -{dmg.amount}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
