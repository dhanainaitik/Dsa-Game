import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';
import { useProgress } from './ProgressContext';

const MultiplayerContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function MultiplayerProvider({ children }) {
  const { user } = useUser();
  const { progress, addBattleTokens, setBattleTokens, addMedals } = useProgress();
  const socketRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle | searching | found | active | ended
  const [mode, setMode] = useState(null);       // '1v1' | 'duo' | '2v2' | 'bg_1v1' | 'bg_2v2'
  const [isBattleGround, setIsBattleGround] = useState(false);
  const [room, setRoom] = useState(null);        // full room payload from server
  const [myTeam, setMyTeam] = useState(null);   // 'A' | 'B'
  const [queueSize, setQueueSize] = useState(0);

  // Battle state (live-updated via events)
  const [teamHP, setTeamHP] = useState({ A: 1000, B: 1000 });
  const [bossHP, setBossHP] = useState(1000);
  const [submissions, setSubmissions] = useState([]); // list of { userId, team, damage, correctness }
  const [comboEvent, setComboEvent] = useState(null);  // { team, bonusDamage } — cleared after anim
  const [eliminatedEvent, setEliminatedEvent] = useState(null); // { team, message }
  const [typingUsers, setTypingUsers] = useState({});   // { userId: true/false }
  const [matchResult, setMatchResult] = useState(null); // { winner, loot, medals }
  const [rateLimited, setRateLimited] = useState(null);
  const [tokenError, setTokenError] = useState(null);

  // Voice state (mute map, speaking map)
  const [voiceMuted, setVoiceMuted] = useState({});
  const [voiceSpeaking, setVoiceSpeaking] = useState({});

  // ── Socket lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { autoConnect: false });
    socketRef.current = socket;
    socket.connect();

    // ── Normal PvP Listeners ──
    socket.on('mp:waiting', (data) => {
      setStatus('searching');
    });

    socket.on('mp:queue_update', ({ queueSize }) => {
      setQueueSize(queueSize);
    });

    socket.on('mp:match_found', (data) => {
      setRoom(data);
      setIsBattleGround(false);
      setMyTeam(data.myTeam);
      setStatus('found');
      if (data.teamHP) setTeamHP(data.teamHP);
      if (data.bossHP !== undefined) setBossHP(data.bossHP);
      setTimeout(() => setStatus('active'), 2500); // brief countdown before arena
    });

    socket.on('mp:submission_result', (result) => {
      setSubmissions(prev => [...prev, result]);
    });

    socket.on('mp:hp_update', ({ teamHP: newTeamHP, bossHP: newBossHP }) => {
      if (newTeamHP) setTeamHP(newTeamHP);
      if (newBossHP !== undefined) setBossHP(newBossHP);
    });

    socket.on('mp:team_combo', (data) => {
      setComboEvent(data);
      setTimeout(() => setComboEvent(null), 2500);
    });

    socket.on('mp:typing', ({ userId, isTyping }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
    });

    socket.on('mp:match_end', (result) => {
      setMatchResult(result);
      setStatus('ended');
      // If a Battle Token was awarded (+1 for PvP win), update progress
      if (result?.loot?.battleTokens) {
        addBattleTokens(result.loot.battleTokens);
      }
    });

    socket.on('mp:player_disconnected', ({ username }) => {
      setMatchResult({ disconnected: true, username });
      setStatus('ended');
    });

    socket.on('mp:search_cancelled', () => {
      setStatus('idle');
      setQueueSize(0);
    });

    socket.on('mp:rate_limited', ({ message }) => {
      setRateLimited(message);
      setTimeout(() => setRateLimited(null), 3000);
    });

    // ── Battle Ground Listeners ──
    socket.on('bg:waiting', (data) => {
      setStatus('searching');
      setIsBattleGround(true);
    });

    socket.on('bg:queue_update', ({ queueSize }) => {
      setQueueSize(queueSize);
    });

    socket.on('bg:token_error', ({ message, battleTokens }) => {
      setStatus('idle');
      setTokenError(message);
      if (battleTokens !== undefined) setBattleTokens(battleTokens);
      setTimeout(() => setTokenError(null), 4000);
    });

    socket.on('bg:match_found', (data) => {
      setRoom(data);
      setIsBattleGround(true);
      setMyTeam(data.myTeam);
      setStatus('found');
      if (data.remainingTokens !== undefined) {
        setBattleTokens(data.remainingTokens);
      }
      if (data.teamHP) setTeamHP(data.teamHP);
      setTimeout(() => setStatus('active'), 2500);
    });

    socket.on('bg:submission_result', (result) => {
      setSubmissions(prev => [...prev, result]);
    });

    socket.on('bg:hp_update', ({ teamHP: newTeamHP }) => {
      if (newTeamHP) setTeamHP(newTeamHP);
    });

    socket.on('bg:team_combo', (data) => {
      setComboEvent(data);
      setTimeout(() => setComboEvent(null), 2500);
    });

    socket.on('bg:eliminated', (data) => {
      setEliminatedEvent(data);
      setTimeout(() => setEliminatedEvent(null), 3500);
    });

    socket.on('bg:typing', ({ userId, isTyping }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
    });

    socket.on('bg:match_end', (result) => {
      setMatchResult(result);
      setStatus('ended');
      // Update local medals if awarded
      if (result.winner === myTeam) {
        addMedals({ gold: 1 });
      } else {
        addMedals({ silver: 1 });
      }
    });

    socket.on('bg:player_disconnected', ({ username }) => {
      setMatchResult({ disconnected: true, username, isBattleGround: true });
      setStatus('ended');
    });

    socket.on('bg:search_cancelled', () => {
      setStatus('idle');
      setQueueSize(0);
      setIsBattleGround(false);
    });

    socket.on('bg:rate_limited', ({ message }) => {
      setRateLimited(message);
      setTimeout(() => setRateLimited(null), 3000);
    });

    // ── Voice Relay Events ──
    socket.on('voice:mute', ({ userId, isMuted }) => {
      setVoiceMuted(prev => ({ ...prev, [userId]: isMuted }));
    });

    socket.on('voice:speaking', ({ userId, isSpeaking }) => {
      setVoiceSpeaking(prev => ({ ...prev, [userId]: isSpeaking }));
    });

    return () => {
      socket.disconnect();
    };
  }, [myTeam]);

  // ── Actions: Normal PvP ───────────────────────────────────────────────────
  const findMatch = (selectedMode) => {
    const socket = socketRef.current;
    if (!socket || !user) return;
    setMode(selectedMode);
    setIsBattleGround(false);
    setStatus('searching');
    setSubmissions([]);
    setMatchResult(null);
    setComboEvent(null);
    setEliminatedEvent(null);
    socket.emit('mp:find_match', {
      mode: selectedMode,
      userId: user.id,
      username: user.username || user.fullName || 'Hunter',
      level: progress?.level || 1,
    });
  };

  const cancelSearch = () => {
    if (isBattleGround) {
      socketRef.current?.emit('bg:cancel_search');
    } else {
      socketRef.current?.emit('mp:cancel_search');
    }
    setStatus('idle');
    setMode(null);
    setQueueSize(0);
  };

  const submitCode = (roomId, testResults) => {
    if (isBattleGround) {
      socketRef.current?.emit('bg:code_submit', {
        roomId,
        userId: user?.id,
        testResults,
      });
    } else {
      socketRef.current?.emit('mp:code_submit', {
        roomId,
        userId: user?.id,
        testResults,
      });
    }
  };

  const sendTyping = (roomId, isTyping) => {
    if (isBattleGround) {
      socketRef.current?.emit('bg:typing', { roomId, userId: user?.id, isTyping });
    } else {
      socketRef.current?.emit('mp:typing', { roomId, userId: user?.id, isTyping });
    }
  };

  // ── Actions: Battle Ground ────────────────────────────────────────────────
  const findBattleGroundMatch = (selectedMode) => {
    const socket = socketRef.current;
    if (!socket || !user) return;
    setMode(selectedMode); // 'bg_1v1' or 'bg_2v2'
    setIsBattleGround(true);
    setStatus('searching');
    setSubmissions([]);
    setMatchResult(null);
    setComboEvent(null);
    setEliminatedEvent(null);
    setTokenError(null);
    socket.emit('bg:find_match', {
      mode: selectedMode,
      userId: user.id,
      username: user.username || user.fullName || 'Hunter',
      level: progress?.level || 1,
    });
  };

  const sendVoiceMute = (roomId, isMuted) => {
    socketRef.current?.emit('voice:mute', { roomId, userId: user?.id, isMuted });
  };

  return (
    <MultiplayerContext.Provider value={{
      socket: socketRef.current,
      status, mode, room, myTeam, queueSize, isBattleGround,
      teamHP, bossHP, submissions, comboEvent, eliminatedEvent, typingUsers,
      matchResult, rateLimited, tokenError,
      voiceMuted, voiceSpeaking,
      findMatch, cancelSearch, submitCode, sendTyping, sendVoiceMute,
      findBattleGroundMatch,
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export const useMultiplayer = () => {
  const ctx = useContext(MultiplayerContext);
  if (!ctx) throw new Error('useMultiplayer must be used within MultiplayerProvider');
  return ctx;
};
