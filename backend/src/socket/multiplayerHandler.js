/**
 * multiplayerHandler.js
 * Full multiplayer socket handler for Normal PvP (1v1, Duo, 2v2) AND Battle Ground (1v1, 2v2).
 * Integrates Battle Token awards on PvP victory and Medal rewards in Battle Ground.
 * Also acts as WebRTC signaling relay for voice chat.
 */

const battleGroundService = require('../services/battleGroundService');

// In-memory queues
const queues = {
  '1v1': [],
  duo: [],
  '2v2': [],
  bg_1v1: [],
  bg_2v2: [],
};

const activeRooms = new Map(); // roomId → RoomState

// Rate limiting: userId → last submission timestamp
const submissionTimestamps = new Map();
const RATE_LIMIT_MS = 10_000; // 10 seconds between submissions per player

// ── Coin Stakes per Mode ──────────────────────────────────────────────────────
const COIN_STAKES = { '1v1': 120, duo: 0, '2v2': 200, bg_1v1: 500, bg_2v2: 800 };
const BASE_ELO_CHANGE = 25; // Flat ELO points exchanged per match

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRoomId(prefix = 'mp') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Standard PvP Problems Pool
 */
const STANDARD_PROBLEMS = [
  {
    id: 'p-arr-1-1',
    title: 'The First Sentinel',
    difficulty: 'Easy',
    mission: 'Retrieve the value stored in the very first vault. Return null if the archive is empty.',
    hint: 'Access index 0. Check length first to handle the empty case.',
    testCases: [
      { input: [1, 2, 3, 4], expected: 1 },
      { input: [42], expected: 42 },
      { input: [], expected: null },
    ],
    functionSignatures: {
      javascript: 'function solve(arr) {\n  // Return the first element, or null if empty\n  \n}',
      python: 'def solve(arr):\n    # Return the first element, or None if empty\n    pass',
    },
  },
  {
    id: 'p-arr-1-3',
    title: 'Maximum Signal',
    difficulty: 'Medium',
    mission: 'Find the highest intensity value in the sensor array. Readings may be negative.',
    hint: 'Math.max() with spread, or iterate tracking a running maximum.',
    testCases: [
      { input: [3, 1, 4, 1, 5, 9, 2, 6], expected: 9 },
      { input: [-5, -1, -3], expected: -1 },
      { input: [7], expected: 7 },
    ],
    functionSignatures: {
      javascript: 'function solve(arr) {\n  // Return the maximum value\n  \n}',
      python: 'def solve(arr):\n    # Return the maximum value\n    pass',
    },
  },
  {
    id: 'p-arr-2-1',
    title: 'Two-Sum Gate',
    difficulty: 'Medium',
    mission: 'Find two indices whose values sum to the target. Return the indices as [i, j].',
    hint: 'Use a Map to store seen values. For each element, check if (target - element) was seen.',
    testCases: [
      { input: '[2, 7, 11, 15], 9', expected: '[0, 1]' },
      { input: '[3, 2, 4], 6', expected: '[1, 2]' },
      { input: '[3, 3], 6', expected: '[0, 1]' },
    ],
    functionSignatures: {
      javascript: 'function solve(arr, target) {\n  // Return [i, j] where arr[i] + arr[j] === target\n  \n}',
      python: 'def solve(arr, target):\n    # Return [i, j]\n    pass',
    },
  },
  {
    id: 'p-arr-2-3',
    title: 'Subarray Sum',
    difficulty: 'Hard',
    mission: 'Find the contiguous subarray with the largest sum and return that sum.',
    hint: "Kadane's Algorithm: at each position, extend previous subarray or start fresh.",
    testCases: [
      { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: '6' },
      { input: '[1]', expected: '1' },
      { input: '[-1, -2, -3]', expected: '-1' },
    ],
    functionSignatures: {
      javascript: 'function solve(arr) {\n  // Return the maximum subarray sum\n  \n}',
      python: 'def solve(arr):\n    # Return the maximum subarray sum\n    pass',
    },
  },
];

/**
 * Tournament-grade Battle Ground Problems Pool
 */
const BATTLE_GROUND_PROBLEMS = [
  {
    id: 'bg-dp-1',
    title: 'Monarch’s Longest Increasing Subsequence',
    difficulty: 'Tournament Hard',
    mission: 'Given an integer array nums, return the length of the longest strictly increasing subsequence. Optimize for O(n log n).',
    hint: 'Use dynamic programming with binary search (patience sorting) for peak combat speed.',
    testCases: [
      { input: [10, 9, 2, 5, 3, 7, 101, 18], expected: 4 },
      { input: [0, 1, 0, 3, 2, 3], expected: 4 },
      { input: [7, 7, 7, 7, 7, 7], expected: 1 },
    ],
    functionSignatures: {
      javascript: 'function solve(nums) {\n  // Return length of longest increasing subsequence\n  \n}',
      python: 'def solve(nums):\n    # Return length of longest increasing subsequence\n    pass',
    },
  },
  {
    id: 'bg-arr-2',
    title: 'Apex Trapping Rain Water',
    difficulty: 'Tournament Hard',
    mission: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    hint: 'Two pointer approach from both ends tracking leftMax and rightMax.',
    testCases: [
      { input: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], expected: 6 },
      { input: [4, 2, 0, 3, 2, 5], expected: 9 },
    ],
    functionSignatures: {
      javascript: 'function solve(height) {\n  // Return total trapped water volume\n  \n}',
      python: 'def solve(height):\n    # Return total trapped water volume\n    pass',
    },
  },
  {
    id: 'bg-str-3',
    title: 'Dimensional Palindromic Partitioning',
    difficulty: 'Tournament Hard',
    mission: 'Given a string s, return the minimum cuts needed for a palindrome partitioning of s.',
    hint: 'DP table or expand around center combined with min cuts memoization.',
    testCases: [
      { input: 'aab', expected: 1 },
      { input: 'a', expected: 0 },
      { input: 'ab', expected: 1 },
    ],
    functionSignatures: {
      javascript: 'function solve(s) {\n  // Return minimum cuts needed\n  \n}',
      python: 'def solve(s):\n    # Return minimum cuts needed\n    pass',
    },
  },
  {
    id: 'bg-graph-4',
    title: 'Shadow Gate Alien Dictionary',
    difficulty: 'Tournament Master',
    mission: 'Given a sorted dictionary of an alien language, derive the valid topological character order. Return empty string if invalid cycle exists.',
    hint: 'Build adjacency graph from adjacent words, compute in-degrees, perform BFS topological sort.',
    testCases: [
      { input: ['wrt', 'wrf', 'er', 'ett', 'rftt'], expected: 'wertf' },
      { input: ['z', 'x'], expected: 'zx' },
      { input: ['z', 'x', 'z'], expected: '' },
    ],
    functionSignatures: {
      javascript: 'function solve(words) {\n  // Return topological ordering as string\n  \n}',
      python: 'def solve(words):\n    # Return topological ordering as string\n    pass',
    },
  },
];

function selectProblem(avgLevel) {
  if (avgLevel < 5) return STANDARD_PROBLEMS[0];
  if (avgLevel < 10) return STANDARD_PROBLEMS[1];
  if (avgLevel < 20) return STANDARD_PROBLEMS[2];
  return STANDARD_PROBLEMS[3];
}

function selectBattleGroundProblem() {
  const index = Math.floor(Math.random() * BATTLE_GROUND_PROBLEMS.length);
  return BATTLE_GROUND_PROBLEMS[index];
}

function calcPlayerDamage(correctness, secondsElapsed, isBattleGround = false) {
  const multiplier = isBattleGround ? 1.5 : 1.0;
  const baseDamage = Math.floor(correctness * 180 * multiplier);
  const speedBonus = Math.max(0, 60 - Math.floor(secondsElapsed / 2));
  return baseDamage + (correctness === 1 ? Math.floor(speedBonus * multiplier) : 0);
}

function calcCoinExchange(mode, winnerCorrectness, loserCorrectness) {
  const stake = COIN_STAKES[mode] || 0;
  const performanceDelta = Math.max(0, (winnerCorrectness || 0) - (loserCorrectness || 0));
  const coinGain = Math.round(stake * (0.5 + performanceDelta * 0.5));
  const coinLoss = coinGain;
  const eloChange = BASE_ELO_CHANGE + Math.round(performanceDelta * 15);
  return { coinGain, coinLoss, eloChange };
}

function sanitizePlayers(players) {
  return players.map((p) => ({
    userId: p.userId,
    username: p.username,
    level: p.level,
    hp: p.hp,
    submitted: p.submitted,
  }));
}

// ─── Room Creation Helpers ────────────────────────────────────────────────────

function create1v1Room(p1, p2, io) {
  const roomId = generateRoomId('mp_1v1');
  const avgLevel = Math.round((p1.level + p2.level) / 2);
  const problem = selectProblem(avgLevel);

  const room = {
    roomId,
    mode: '1v1',
    isBattleGround: false,
    problem,
    teams: {
      A: [{ ...p1, hp: 1000, submitted: false }],
      B: [{ ...p2, hp: 1000, submitted: false }],
    },
    teamHP: { A: 1000, B: 1000 },
    submissions: new Map(),
    startedAt: Date.now(),
    status: 'active',
  };

  activeRooms.set(roomId, room);

  p1.socket.join(roomId);
  p2.socket.join(roomId);

  p1.socket.emit('mp:match_found', {
    roomId,
    mode: '1v1',
    problem,
    teams: { A: sanitizePlayers(room.teams.A), B: sanitizePlayers(room.teams.B) },
    teamHP: room.teamHP,
    myTeam: 'A',
  });

  p2.socket.emit('mp:match_found', {
    roomId,
    mode: '1v1',
    problem,
    teams: { A: sanitizePlayers(room.teams.A), B: sanitizePlayers(room.teams.B) },
    teamHP: room.teamHP,
    myTeam: 'B',
  });

  console.log(`[Normal 1v1] Room ${roomId} created: ${p1.username} vs ${p2.username}`);
}

function createDuoRoom(p1, p2, io) {
  const roomId = generateRoomId('mp_duo');
  const avgLevel = Math.round((p1.level + p2.level) / 2);
  const problem = selectProblem(avgLevel);

  const room = {
    roomId,
    mode: 'duo',
    isBattleGround: false,
    problem,
    teams: {
      A: [
        { ...p1, hp: 100, submitted: false },
        { ...p2, hp: 100, submitted: false },
      ],
      B: [],
    },
    teamHP: { A: 1000 },
    bossHP: 1000,
    submissions: new Map(),
    startedAt: Date.now(),
    status: 'active',
  };

  activeRooms.set(roomId, room);

  p1.socket.join(roomId);
  p2.socket.join(roomId);

  const payload = {
    roomId,
    mode: 'duo',
    problem,
    teams: { A: sanitizePlayers(room.teams.A) },
    bossHP: room.bossHP,
    myTeam: 'A',
  };

  io.to(roomId).emit('mp:match_found', payload);
  console.log(`[DUO] Room ${roomId} created: ${p1.username} + ${p2.username}`);
}

function create2v2Room(teamA, teamB, io) {
  const roomId = generateRoomId('mp_2v2');
  const allLevels = [...teamA, ...teamB].map((p) => p.level);
  const avgLevel = Math.round(allLevels.reduce((a, b) => a + b, 0) / allLevels.length);
  const problem = selectProblem(avgLevel);

  const room = {
    roomId,
    mode: '2v2',
    isBattleGround: false,
    problem,
    teams: {
      A: teamA.map((p) => ({ ...p, hp: 1000, submitted: false })),
      B: teamB.map((p) => ({ ...p, hp: 1000, submitted: false })),
    },
    teamHP: { A: 2000, B: 2000 },
    submissions: new Map(),
    startedAt: Date.now(),
    status: 'active',
  };

  activeRooms.set(roomId, room);

  teamA.forEach((p) => p.socket.join(roomId));
  teamB.forEach((p) => p.socket.join(roomId));

  teamA.forEach((p) => {
    p.socket.emit('mp:match_found', {
      roomId,
      mode: '2v2',
      problem,
      teams: { A: sanitizePlayers(room.teams.A), B: sanitizePlayers(room.teams.B) },
      teamHP: room.teamHP,
      myTeam: 'A',
    });
  });

  teamB.forEach((p) => {
    p.socket.emit('mp:match_found', {
      roomId,
      mode: '2v2',
      problem,
      teams: { A: sanitizePlayers(room.teams.A), B: sanitizePlayers(room.teams.B) },
      teamHP: room.teamHP,
      myTeam: 'B',
    });
  });

  console.log(`[Normal 2v2] Room ${roomId} created`);
}

// ─── Battle Ground Room Creation ──────────────────────────────────────────────

function createBattleGround1v1Room(p1, p2, io, remainingBalances = {}) {
  const roomId = generateRoomId('bg_1v1');
  const problem = selectBattleGroundProblem();

  const room = {
    roomId,
    mode: 'bg_1v1',
    isBattleGround: true,
    problem,
    teams: {
      A: [{ ...p1, hp: 1000, submitted: false }],
      B: [{ ...p2, hp: 1000, submitted: false }],
    },
    teamHP: { A: 1000, B: 1000 },
    submissions: new Map(),
    startedAt: Date.now(),
    status: 'active',
  };

  activeRooms.set(roomId, room);

  p1.socket.join(roomId);
  p2.socket.join(roomId);

  p1.socket.emit('bg:match_found', {
    roomId,
    mode: 'bg_1v1',
    problem,
    teams: { A: sanitizePlayers(room.teams.A), B: sanitizePlayers(room.teams.B) },
    teamHP: room.teamHP,
    myTeam: 'A',
    remainingTokens: remainingBalances[p1.userId] ?? 0,
  });

  p2.socket.emit('bg:match_found', {
    roomId,
    mode: 'bg_1v1',
    problem,
    teams: { A: sanitizePlayers(room.teams.A), B: sanitizePlayers(room.teams.B) },
    teamHP: room.teamHP,
    myTeam: 'B',
    remainingTokens: remainingBalances[p2.userId] ?? 0,
  });

  console.log(`[Battle Ground 1v1] Room ${roomId} created: ${p1.username} vs ${p2.username}`);
}

function createBattleGround2v2Room(teamA, teamB, io, remainingBalances = {}) {
  const roomId = generateRoomId('bg_2v2');
  const problem = selectBattleGroundProblem();

  const room = {
    roomId,
    mode: 'bg_2v2',
    isBattleGround: true,
    problem,
    teams: {
      A: teamA.map((p) => ({ ...p, hp: 1000, submitted: false })),
      B: teamB.map((p) => ({ ...p, hp: 1000, submitted: false })),
    },
    teamHP: { A: 2000, B: 2000 },
    submissions: new Map(),
    startedAt: Date.now(),
    status: 'active',
  };

  activeRooms.set(roomId, room);

  teamA.forEach((p) => p.socket.join(roomId));
  teamB.forEach((p) => p.socket.join(roomId));

  teamA.forEach((p) => {
    p.socket.emit('bg:match_found', {
      roomId,
      mode: 'bg_2v2',
      problem,
      teams: { A: sanitizePlayers(room.teams.A), B: sanitizePlayers(room.teams.B) },
      teamHP: room.teamHP,
      myTeam: 'A',
      remainingTokens: remainingBalances[p.userId] ?? 0,
    });
  });

  teamB.forEach((p) => {
    p.socket.emit('bg:match_found', {
      roomId,
      mode: 'bg_2v2',
      problem,
      teams: { A: sanitizePlayers(room.teams.A), B: sanitizePlayers(room.teams.B) },
      teamHP: room.teamHP,
      myTeam: 'B',
      remainingTokens: remainingBalances[p.userId] ?? 0,
    });
  });

  console.log(`[Battle Ground 2v2] Room ${roomId} created`);
}

// ─── Main Socket Handler ──────────────────────────────────────────────────────

const setupMultiplayer = (io) => {
  io.on('connection', (socket) => {
    console.log(`[MP] Client connected: ${socket.id}`);

    // ── Disconnect cleanup ──────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[MP] Client disconnected: ${socket.id}`);

      // Remove from normal queues
      queues['1v1'] = queues['1v1'].filter((p) => p.socket.id !== socket.id);
      queues.duo = queues.duo.filter((p) => p.socket.id !== socket.id);
      queues['2v2'] = queues['2v2'].filter((p) => p.socket.id !== socket.id);

      // Remove from Battle Ground queues
      queues.bg_1v1 = queues.bg_1v1.filter((p) => p.socket.id !== socket.id);
      queues.bg_2v2 = queues.bg_2v2.filter((p) => p.socket.id !== socket.id);

      // Notify active room of forfeit
      for (const [roomId, room] of activeRooms.entries()) {
        const allPlayers = [...room.teams.A, ...room.teams.B];
        const disconnected = allPlayers.find((p) => p.socket.id === socket.id);
        if (disconnected) {
          if (room.status !== 'ended') {
            room.status = 'ended';
            const eventName = room.isBattleGround ? 'bg:player_disconnected' : 'mp:player_disconnected';
            socket.to(roomId).emit(eventName, {
              userId: disconnected.userId,
              username: disconnected.username,
            });
          }
          activeRooms.delete(roomId);
          break;
        }
      }
    });

    // ── Normal Matchmaking ──────────────────────────────────────────────────
    socket.on('mp:find_match', ({ mode, userId, username, level }) => {
      const playerData = { socket, userId, username: username || 'Hunter', level: level || 1 };

      if (mode === '1v1') {
        if (queues['1v1'].length >= 1) {
          const opponent = queues['1v1'].shift();
          if (opponent.socket.id !== socket.id) {
            create1v1Room(opponent, playerData, io);
            return;
          }
          queues['1v1'].push(opponent);
        }
        queues['1v1'].push(playerData);
        socket.emit('mp:waiting', { message: 'Searching for an opponent...', mode: '1v1', queueSize: 1 });
      } else if (mode === 'duo') {
        if (queues.duo.length >= 1) {
          const p1 = queues.duo.shift();
          if (p1.socket.id !== socket.id) {
            createDuoRoom(p1, playerData, io);
            return;
          }
          queues.duo.push(p1);
        }
        queues.duo.push(playerData);
        socket.emit('mp:waiting', { message: 'Searching for a co-op partner...', mode: 'duo' });
      } else if (mode === '2v2') {
        queues['2v2'].push(playerData);

        if (queues['2v2'].length >= 4) {
          const [p1, p2, p3, p4] = queues['2v2'].splice(0, 4);
          create2v2Room([p1, p2], [p3, p4], io);
        } else {
          socket.emit('mp:waiting', {
            message: `In queue — ${queues['2v2'].length}/4 players found...`,
            mode: '2v2',
            queueSize: queues['2v2'].length,
          });
          queues['2v2'].forEach((p) =>
            p.socket.emit('mp:queue_update', { queueSize: queues['2v2'].length })
          );
        }
      }
    });

    socket.on('mp:cancel_search', () => {
      queues['1v1'] = queues['1v1'].filter((p) => p.socket.id !== socket.id);
      queues.duo = queues.duo.filter((p) => p.socket.id !== socket.id);
      queues['2v2'] = queues['2v2'].filter((p) => p.socket.id !== socket.id);
      socket.emit('mp:search_cancelled');
    });

    // ── Battle Ground Matchmaking (Requires 5 Tokens) ───────────────────────
    socket.on('bg:find_match', async ({ mode, userId, username, level }) => {
      // 1. Verify user token balance (requires >= 5)
      const check = await battleGroundService.checkBattleTokens(userId);
      if (!check.hasEnough) {
        socket.emit('bg:token_error', {
          message: 'Insufficient Battle Tokens! You need 5 Battle Tokens earned from normal PvP victories.',
          battleTokens: check.battleTokens,
        });
        return;
      }

      const playerData = { socket, userId, username: username || 'Hunter', level: level || 1 };

      if (mode === 'bg_1v1') {
        if (queues.bg_1v1.length >= 1) {
          const opponent = queues.bg_1v1.shift();
          if (opponent.socket.id !== socket.id) {
            // Deduct 5 tokens from both participants atomically
            const deduction = await battleGroundService.deductEntryTokens([opponent.userId, userId]);
            if (deduction.success) {
              createBattleGround1v1Room(opponent, playerData, io, deduction.balances);
              return;
            } else {
              // If deduction failed for a user, notify and recover
              if (deduction.failedClerkId === opponent.userId) {
                opponent.socket.emit('bg:token_error', { message: 'Token deduction failed. Please re-enter.' });
                queues.bg_1v1.push(playerData);
              } else {
                socket.emit('bg:token_error', { message: 'Token deduction failed. Please re-enter.' });
                queues.bg_1v1.push(opponent);
              }
              return;
            }
          }
          queues.bg_1v1.push(opponent);
        }
        queues.bg_1v1.push(playerData);
        socket.emit('bg:waiting', { message: 'Seeking Battle Ground Challenger (1v1)...', mode: 'bg_1v1', queueSize: 1 });
      } else if (mode === 'bg_2v2') {
        queues.bg_2v2.push(playerData);

        if (queues.bg_2v2.length >= 4) {
          const [p1, p2, p3, p4] = queues.bg_2v2.splice(0, 4);
          const allUserIds = [p1.userId, p2.userId, p3.userId, p4.userId];
          const deduction = await battleGroundService.deductEntryTokens(allUserIds);

          if (deduction.success) {
            // Snake draft balance
            createBattleGround2v2Room([p1, p4], [p2, p3], io, deduction.balances);
          } else {
            // Put players back in queue
            [p1, p2, p3, p4].forEach((p) => queues.bg_2v2.push(p));
            socket.emit('bg:token_error', { message: 'One or more players had insufficient tokens.' });
          }
        } else {
          socket.emit('bg:waiting', {
            message: `In Battle Ground queue — ${queues.bg_2v2.length}/4 warriors assembled...`,
            mode: 'bg_2v2',
            queueSize: queues.bg_2v2.length,
          });
          queues.bg_2v2.forEach((p) =>
            p.socket.emit('bg:queue_update', { queueSize: queues.bg_2v2.length })
          );
        }
      }
    });

    socket.on('bg:cancel_search', () => {
      queues.bg_1v1 = queues.bg_1v1.filter((p) => p.socket.id !== socket.id);
      queues.bg_2v2 = queues.bg_2v2.filter((p) => p.socket.id !== socket.id);
      socket.emit('bg:search_cancelled');
    });

    // ── Code Submission (Normal PvP) ────────────────────────────────────────
    socket.on('mp:code_submit', async ({ roomId, userId, code, language, testResults }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.status !== 'active') return;

      const lastSubmit = submissionTimestamps.get(userId);
      if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
        socket.emit('mp:rate_limited', {
          message: `Wait ${Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSubmit)) / 1000)}s before resubmitting.`,
        });
        return;
      }
      submissionTimestamps.set(userId, Date.now());

      let playerTeam = null;
      let player = room.teams.A.find((p) => p.userId === userId);
      if (player) {
        playerTeam = 'A';
      } else {
        player = room.teams.B.find((p) => p.userId === userId);
        if (player) playerTeam = 'B';
      }

      if (!player || !playerTeam) return;
      player.submitted = true;

      const passed = (testResults || []).filter((r) => r.passed).length;
      const total = Math.max((testResults || []).length, 1);
      const correctness = passed / total;

      const secondsElapsed = Math.floor((Date.now() - room.startedAt) / 1000);
      const damage = calcPlayerDamage(correctness, secondsElapsed, false);

      room.submissions.set(userId, { timestamp: Date.now(), correctness, damage });

      io.to(roomId).emit('mp:submission_result', {
        userId,
        username: player.username,
        team: playerTeam,
        correctness,
        damage,
        testResults: testResults || [],
      });

      if (room.mode === '1v1' || room.mode === '2v2') {
        const opposingTeam = playerTeam === 'A' ? 'B' : 'A';
        room.teamHP[opposingTeam] = Math.max(0, room.teamHP[opposingTeam] - damage);

        if (room.mode === '2v2') {
          const teamPlayers = room.teams[playerTeam];
          const teamSubmissions = teamPlayers.map((p) => room.submissions.get(p.userId)).filter(Boolean);

          if (teamSubmissions.length === teamPlayers.length) {
            const timestamps = teamSubmissions.map((s) => s.timestamp);
            const timeDiff = Math.abs(timestamps[0] - timestamps[1]);

            if (timeDiff <= 5000 && teamSubmissions.every((s) => s.correctness >= 0.8)) {
              const comboBonusDamage = Math.floor(
                teamSubmissions.reduce((sum, s) => sum + s.damage, 0) * 0.5
              );
              room.teamHP[opposingTeam] = Math.max(0, room.teamHP[opposingTeam] - comboBonusDamage);
              io.to(roomId).emit('mp:team_combo', {
                team: playerTeam,
                bonusDamage: comboBonusDamage,
                teamHP: room.teamHP,
              });
            }
          }
        }

        io.to(roomId).emit('mp:hp_update', { teamHP: room.teamHP });

        // Normal PvP Win condition
        if (room.teamHP[opposingTeam] <= 0) {
          room.status = 'ended';
          const is1v1 = room.mode === '1v1';

          const winnerBestCorrectness = Math.max(
            ...(room.teams[playerTeam] || []).map((p) => room.submissions.get(p.userId)?.correctness || 0)
          );
          const loserBestCorrectness = Math.max(
            ...(room.teams[opposingTeam] || []).map((p) => room.submissions.get(p.userId)?.correctness || 0)
          );

          const { coinGain, coinLoss, eloChange } = calcCoinExchange(
            room.mode,
            winnerBestCorrectness,
            loserBestCorrectness
          );

          // Award +1 Battle Token to normal PvP winners in Supabase database!
          const winnerClerkIds = (room.teams[playerTeam] || []).map((p) => p.userId).filter(Boolean);
          const loserClerkIds = (room.teams[opposingTeam] || []).map((p) => p.userId).filter(Boolean);

          battleGroundService.awardPvPWinToken(roomId, winnerClerkIds, loserClerkIds).catch((err) => {
            console.error('[PvP Award Error]:', err.message);
          });

          io.to(roomId).emit('mp:match_end', {
            winner: playerTeam,
            loser: opposingTeam,
            loot: {
              xp: is1v1 ? 350 : 500,
              coins: coinGain,
              coinsLost: coinLoss,
              eloChange,
              battleTokens: 1, // +1 Battle Token awarded
            },
          });
          activeRooms.delete(roomId);
        }
      } else if (room.mode === 'duo') {
        room.bossHP = Math.max(0, room.bossHP - damage);
        io.to(roomId).emit('mp:hp_update', { bossHP: room.bossHP });

        const teamSubmissions = room.teams.A.map((p) => room.submissions.get(p.userId)).filter(Boolean);
        if (teamSubmissions.length === room.teams.A.length) {
          const timestamps = teamSubmissions.map((s) => s.timestamp);
          const timeDiff = Math.abs(timestamps[0] - timestamps[1]);
          if (timeDiff <= 5000 && teamSubmissions.every((s) => s.correctness >= 0.8)) {
            const comboBonusDamage = Math.floor(
              teamSubmissions.reduce((sum, s) => sum + s.damage, 0) * 0.5
            );
            room.bossHP = Math.max(0, room.bossHP - comboBonusDamage);
            io.to(roomId).emit('mp:team_combo', { team: 'A', bonusDamage: comboBonusDamage, bossHP: room.bossHP });
            io.to(roomId).emit('mp:hp_update', { bossHP: room.bossHP });
          }
        }

        if (room.bossHP <= 0) {
          room.status = 'ended';
          io.to(roomId).emit('mp:match_end', {
            winner: 'A',
            loot: { xp: 400, coins: 150 },
          });
          activeRooms.delete(roomId);
        }
      }
    });

    // ── Code Submission (Battle Ground) ─────────────────────────────────────
    socket.on('bg:code_submit', async ({ roomId, userId, code, language, testResults }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.status !== 'active' || !room.isBattleGround) return;

      const lastSubmit = submissionTimestamps.get(userId);
      if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
        socket.emit('bg:rate_limited', {
          message: `Wait ${Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSubmit)) / 1000)}s before resubmitting.`,
        });
        return;
      }
      submissionTimestamps.set(userId, Date.now());

      let playerTeam = null;
      let player = room.teams.A.find((p) => p.userId === userId);
      if (player) {
        playerTeam = 'A';
      } else {
        player = room.teams.B.find((p) => p.userId === userId);
        if (player) playerTeam = 'B';
      }

      if (!player || !playerTeam) return;
      player.submitted = true;

      const passed = (testResults || []).filter((r) => r.passed).length;
      const total = Math.max((testResults || []).length, 1);
      const correctness = passed / total;

      const secondsElapsed = Math.floor((Date.now() - room.startedAt) / 1000);
      const damage = calcPlayerDamage(correctness, secondsElapsed, true);

      room.submissions.set(userId, { timestamp: Date.now(), correctness, damage });

      io.to(roomId).emit('bg:submission_result', {
        userId,
        username: player.username,
        team: playerTeam,
        correctness,
        damage,
        testResults: testResults || [],
      });

      const opposingTeam = playerTeam === 'A' ? 'B' : 'A';
      room.teamHP[opposingTeam] = Math.max(0, room.teamHP[opposingTeam] - damage);

      // Battle Ground Team Combo (in 2v2)
      if (room.mode === 'bg_2v2') {
        const teamPlayers = room.teams[playerTeam];
        const teamSubmissions = teamPlayers.map((p) => room.submissions.get(p.userId)).filter(Boolean);

        if (teamSubmissions.length === teamPlayers.length) {
          const timestamps = teamSubmissions.map((s) => s.timestamp);
          const timeDiff = Math.abs(timestamps[0] - timestamps[1]);

          if (timeDiff <= 5000 && teamSubmissions.every((s) => s.correctness >= 0.8)) {
            const comboBonusDamage = Math.floor(
              teamSubmissions.reduce((sum, s) => sum + s.damage, 0) * 0.6
            );
            room.teamHP[opposingTeam] = Math.max(0, room.teamHP[opposingTeam] - comboBonusDamage);
            io.to(roomId).emit('bg:team_combo', {
              team: playerTeam,
              bonusDamage: comboBonusDamage,
              teamHP: room.teamHP,
            });
          }
        }
      }

      io.to(roomId).emit('bg:hp_update', { teamHP: room.teamHP });

      // Battle Ground Win / Elimination condition
      if (room.teamHP[opposingTeam] <= 0) {
        room.status = 'ended';
        const is1v1 = room.mode === 'bg_1v1';

        const winnerPlayers = room.teams[playerTeam] || [];
        const loserPlayers = room.teams[opposingTeam] || [];

        // Broadcast elimination effect
        io.to(roomId).emit('bg:eliminated', {
          team: opposingTeam,
          eliminatedUserIds: loserPlayers.map((p) => p.userId),
          message: `Team ${opposingTeam} has been eliminated from the Battle Ground!`,
        });

        // Record tournament match and award Medals (GOLD to winners, SILVER to runners-up)
        const participants = [
          ...winnerPlayers.map((p) => ({
            clerkId: p.userId,
            team: playerTeam,
            damageDealt: room.submissions.get(p.userId)?.damage || 0,
            correctness: room.submissions.get(p.userId)?.correctness || 0,
          })),
          ...loserPlayers.map((p) => ({
            clerkId: p.userId,
            team: opposingTeam,
            damageDealt: room.submissions.get(p.userId)?.damage || 0,
            correctness: room.submissions.get(p.userId)?.correctness || 0,
          })),
        ];

        battleGroundService
          .recordBattleGroundMatch({
            roomId,
            mode: room.mode,
            problemId: room.problem?.id,
            winnerTeam: playerTeam,
            participants,
          })
          .catch((err) => console.error('[BattleGround Record Error]:', err.message));

        const medalMap = {};
        winnerPlayers.forEach((p) => { medalMap[p.userId] = 'GOLD'; });
        loserPlayers.forEach((p) => { medalMap[p.userId] = 'SILVER'; });

        io.to(roomId).emit('bg:match_end', {
          winner: playerTeam,
          loser: opposingTeam,
          medals: medalMap,
          loot: {
            xp: is1v1 ? 1000 : 1500,
            coins: is1v1 ? 450 : 700,
            goldMedal: 1,
            silverMedal: 1,
            title: is1v1 ? 'Battle Ground Duelist' : 'Battle Ground Warlord',
          },
        });
        activeRooms.delete(roomId);
      }
    });

    // ── Typing Indicators ───────────────────────────────────────────────────
    socket.on('mp:typing', ({ roomId, userId, isTyping }) => {
      socket.to(roomId).emit('mp:typing', { userId, isTyping });
    });

    socket.on('bg:typing', ({ roomId, userId, isTyping }) => {
      socket.to(roomId).emit('bg:typing', { userId, isTyping });
    });

    // ── WebRTC Voice Signaling Relay (Shared across all modes) ──────────────
    socket.on('voice:offer', ({ roomId, targetUserId, offer, fromUserId }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;
      const allPlayers = [...room.teams.A, ...room.teams.B];
      const target = allPlayers.find((p) => p.userId === targetUserId);
      if (target) {
        target.socket.emit('voice:offer', { offer, fromUserId });
      }
    });

    socket.on('voice:answer', ({ roomId, targetUserId, answer, fromUserId }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;
      const allPlayers = [...room.teams.A, ...room.teams.B];
      const target = allPlayers.find((p) => p.userId === targetUserId);
      if (target) {
        target.socket.emit('voice:answer', { answer, fromUserId });
      }
    });

    socket.on('voice:ice', ({ roomId, targetUserId, candidate, fromUserId }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;
      const allPlayers = [...room.teams.A, ...room.teams.B];
      const target = allPlayers.find((p) => p.userId === targetUserId);
      if (target) {
        target.socket.emit('voice:ice', { candidate, fromUserId });
      }
    });

    socket.on('voice:mute', ({ roomId, userId, isMuted }) => {
      socket.to(roomId).emit('voice:mute', { userId, isMuted });
    });

    socket.on('voice:speaking', ({ roomId, userId, isSpeaking }) => {
      socket.to(roomId).emit('voice:speaking', { userId, isSpeaking });
    });
  });
};

module.exports = setupMultiplayer;
