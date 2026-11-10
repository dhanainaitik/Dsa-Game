import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { STATES } from '../data/problems';
import { ITEMS } from '../data/items';
import { useAuth } from './AuthContext';

const ProgressContext = createContext(null);

// Initial state for V3 + Battle Ground
const DEFAULT_STATE = {
  solvedProblems: {}, // { problemId: true }
  rewardedProblems: {}, // { [problemId]: true } -> tracks exactly which problems have received the +20 coins
  coinTransactions: [], // [{ id, problemId, problemTitle, section, coins: 20, timestamp }]
  problemStats: {},   // { problemId: { score, attempts, xp, coins } }
  completedStates: {}, // { stateId: true }
  xp: 0,
  level: 1,
  coins: 100, // starting coins
  battleTokens: 0, // 5 tokens = 1 Battle Ground entry
  goldMedals: 0,
  silverMedals: 0,
  bronzeMedals: 0,
  unlockedRegions: { arrays: true }, 
  inventory: {}, // { [itemId]: quantity }
  activeBuffs: {}, // { [buffKey]: timestamp | boolean }
};

function loadProgress() {
  try {
    const saved = localStorage.getItem('codo-progress');
    // Ensure all new keys from DEFAULT_STATE are present if an old v2 state is loaded
    return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

// XP thresholds generated roughly matching the spec curve
const getXPForLevel = (level) => {
  if (level === 1) return 0;
  const n = level - 1;
  return Math.floor(500 * n * (1 + n * 0.10));
};

const getLevelFromXP = (xp) => {
  let lvl = 1;
  while (lvl < 60 && xp >= getXPForLevel(lvl + 1)) {
    lvl++;
  }
  return lvl;
};

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress);
  const [rewardToast, setRewardToast] = useState(null);
  const clearRewardToast = () => setRewardToast(null);
  const inFlightRewardsRef = useRef(new Set());

  const { user } = useAuth();

  // Fetch live backend profile stats on login (tokens, medals)
  useEffect(() => {
    if (!user?.id) return;
    const fetchLiveStats = async () => {
      try {
        const token = await user.getToken();
        if (!token) return;
        const res = await fetch('/api/battleground/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const stats = await res.json();
          setProgress(prev => ({
            ...prev,
            battleTokens: stats.battleTokens ?? prev.battleTokens ?? 0,
            goldMedals: stats.goldMedals ?? prev.goldMedals ?? 0,
            silverMedals: stats.silverMedals ?? prev.silverMedals ?? 0,
            bronzeMedals: stats.bronzeMedals ?? prev.bronzeMedals ?? 0,
          }));
        }
      } catch (err) {
        console.warn('Battle stats sync error:', err);
      }
    };
    fetchLiveStats();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('codo-progress', JSON.stringify(progress));

    // Attempt to sync to backend
    const syncToBackend = async () => {
      if (!user?.id) return;

      let token;
      try {
        token = await user.getToken();
      } catch {
        return; // Clerk not ready yet
      }

      if (!token) return;

      try {
        await fetch(`/api/progress/${user.id}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(progress)
        });
      } catch (err) {
        console.warn('Backend sync failed or API unavailable. Relying on local storage.', err);
      }
    };

    syncToBackend();

  }, [progress, user]);

  // Buff status helper
  const isBuffActive = (buffKey) => {
    const val = progress.activeBuffs?.[buffKey];
    if (!val) return false;
    if (typeof val === 'number') {
      return Date.now() < val;
    }
    return Boolean(val);
  };

  const activateBuff = (buffKey, durationMs = 3600000) => {
    setProgress(prev => ({
      ...prev,
      activeBuffs: {
        ...(prev.activeBuffs || {}),
        [buffKey]: durationMs ? Date.now() + durationMs : true,
      },
    }));
  };

  const clearBuff = (buffKey) => {
    setProgress(prev => {
      if (!prev.activeBuffs || !(buffKey in prev.activeBuffs)) return prev;
      const nextBuffs = { ...prev.activeBuffs };
      delete nextBuffs[buffKey];
      return {
        ...prev,
        activeBuffs: nextBuffs,
      };
    });
  };

  // V3 Scoring & Damage Formula
  const calculateRewards = (difficulty, attempts, correctness = 1.0, efficiency = 1.0, quality = 1.0, options = {}) => {
    const baseXP = { 'Easy': 50, 'Easy-Medium': 80, 'Medium': 120, 'Medium-Hard': 180, 'Hard': 250 }[difficulty] || 50;
    const baseCoins = { 'Easy': 15, 'Easy-Medium': 25, 'Medium': 40, 'Medium-Hard': 60, 'Hard': 90 }[difficulty] || 15;

    // If focus charm is active, attempt penalty is negated (effective attempts = 1)
    const effectiveAttempts = (options.focusCharmActive || options.attempts === 1) ? 1 : Math.max(1, attempts);

    const score = (0.60 * correctness) + (0.25 * Math.min(1, efficiency)) + (0.15 * Math.min(1, quality));
    const attempt_multiplier = Math.max(0.50, 1.0 - (effectiveAttempts - 1) * 0.10);
    const final_score = score * attempt_multiplier;
    
    const critical_hit = (final_score >= 0.95 && effectiveAttempts === 1);
    const crit_mod = critical_hit ? 1.5 : 1.0;

    // XP boost (from XP Tome +50%)
    const xpBoostMod = (options.xpBoostActive || isBuffActive('xp_tome')) ? 1.5 : 1.0;

    // Coin boost (from Lightning Flask 2x)
    let coinMod = 1.0;
    if (options.doubleCoins || options.lightningFlaskActive) {
      coinMod *= 2.0;
    }

    return {
      score: final_score,
      xpGain: Math.floor(baseXP * final_score * crit_mod * xpBoostMod),
      coinGain: Math.floor(baseCoins * final_score * attempt_multiplier * (critical_hit ? 1.5 : 1.0) * coinMod),
      critical: critical_hit
    };
  };

  // Check if a problem has already been rewarded with coins
  const isProblemRewarded = (problemId) => {
    if (!problemId) return false;
    const cleanId = String(problemId).trim().toLowerCase();
    return Boolean(progress.rewardedProblems?.[cleanId]);
  };

  // Centralized Global Coin Reward Service (Awards +20 coins once per unique problem)
  const awardProblemCoins = (problemId, options = {}) => {
    if (!problemId) return { success: false, reason: 'missing_id', coinsAwarded: 0 };
    const cleanId = String(problemId).trim().toLowerCase();

    // 1. Guard against duplicate reward
    if (progress.rewardedProblems?.[cleanId]) {
      return { success: false, reason: 'already_rewarded', coinsAwarded: 0 };
    }

    try {
      const saved = JSON.parse(localStorage.getItem('codo-progress') || '{}');
      if (saved.rewardedProblems?.[cleanId]) {
        return { success: false, reason: 'already_rewarded', coinsAwarded: 0 };
      }
    } catch {
      // ignore
    }

    // 2. Debounce in-flight race condition lock
    if (inFlightRewardsRef.current.has(cleanId)) {
      return { success: false, reason: 'already_processing', coinsAwarded: 0 };
    }
    inFlightRewardsRef.current.add(cleanId);

    // 3. Exact 20 coins reward (+40 if lightning flask is active)
    const isDouble = Boolean(options.lightningFlaskActive || options.multiplier === 2);
    const coinsToAward = isDouble ? 40 : 20;
    const problemTitle = options.problemTitle || options.title || cleanId;
    const sectionName = options.section || 'Coding Challenge';

    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      problemId: cleanId,
      problemTitle,
      section: sectionName,
      coins: coinsToAward,
      timestamp: new Date().toISOString(),
    };

    setProgress(prev => {
      if (prev.rewardedProblems?.[cleanId]) return prev;

      return {
        ...prev,
        coins: (prev.coins ?? 100) + coinsToAward,
        rewardedProblems: {
          ...(prev.rewardedProblems || {}),
          [cleanId]: true,
        },
        solvedProblems: {
          ...(prev.solvedProblems || {}),
          [cleanId]: true,
        },
        coinTransactions: [
          transaction,
          ...(prev.coinTransactions || []).slice(0, 99),
        ],
      };
    });

    // 4. Trigger Global Reward Toast / Animation
    setRewardToast({
      coins: coinsToAward,
      title: problemTitle,
      section: sectionName,
      id: Date.now(),
    });

    setTimeout(() => {
      inFlightRewardsRef.current.delete(cleanId);
    }, 1200);

    return {
      success: true,
      coinsAwarded: coinsToAward,
      transaction,
    };
  };

  const markSolved = (problemId, stateId, difficulty = 'Easy', attempts = 1, options = {}) => {
    const rewards = calculateRewards(difficulty, attempts, 1.0, 1.0, 1.0, options);
    let totalXPGain = 0;
    const cleanId = String(problemId).trim().toLowerCase();

    // Trigger atomic 20-coin global reward for first-time solve
    const rewardRes = awardProblemCoins(cleanId, {
      problemTitle: options.problemTitle || STATES[stateId]?.problems?.find(p => p === problemId) || cleanId,
      section: options.section || 'World Map Challenge',
      lightningFlaskActive: options.lightningFlaskActive,
    });

    setProgress(prev => {
      const isFirstSolve = !prev.solvedProblems[cleanId] && !prev.solvedProblems[problemId];
      totalXPGain = rewards.xpGain + (isFirstSolve ? 30 : 0);

      const newXP = prev.xp + totalXPGain;
      const newLevel = getLevelFromXP(newXP);

      const newSolved = { 
        ...prev.solvedProblems, 
        [problemId]: true,
        [cleanId]: true 
      };
      const newStats = { 
        ...prev.problemStats, 
        [problemId]: { 
          attempts, 
          score: rewards.score, 
          xp: totalXPGain, 
          coinsAwarded: rewardRes.coinsAwarded 
        } 
      };
      
      const state = STATES[stateId];
      const stateComplete = state?.problems.every(pid => newSolved[pid]);
      const newCompletedStates = stateComplete
        ? { ...prev.completedStates, [stateId]: true }
        : prev.completedStates;

      let newUnlocked = { ...prev.unlockedRegions };
      if (stateComplete && state) {
        newUnlocked[state.regionId] = true;
      }

      return {
        ...prev,
        solvedProblems: newSolved,
        problemStats: newStats,
        completedStates: newCompletedStates,
        unlockedRegions: newUnlocked,
        xp: newXP,
        level: newLevel,
      };
    });
    
    return {
      ...rewards,
      coinsAwarded: rewardRes.coinsAwarded,
      isNewReward: rewardRes.success,
    };
  };

  const deductPlayerHP = (enemyBaseAttack, correctness) => {
    return Math.floor(enemyBaseAttack * (1 - correctness));
  };
  
  const getPlayerDamage = (baseDamage, score) => {
    return Math.floor(baseDamage * score);
  };

  const addCoins = (amount) => setProgress(prev => ({ ...prev, coins: prev.coins + amount }));
  const spendCoins = (amount) => setProgress(prev => ({ ...prev, coins: Math.max(0, prev.coins - amount) }));

  // Inventory Management System
  const buyItem = (item) => {
    if (!item || !item.id) return { success: false, reason: 'invalid_item' };
    const price = Number(item.price) || 0;

    if ((progress.coins || 0) < price) {
      return { success: false, reason: 'insufficient_coins', currentCoins: progress.coins || 0, price };
    }

    let updatedQty = 1;
    setProgress(prev => {
      const currentCoins = prev.coins ?? 0;
      if (currentCoins < price) return prev;

      const nextCoins = currentCoins - price;

      // Handle map region unlocks
      if (item.type === 'map' || ['strings', 'linked-lists', 'trees'].includes(item.id)) {
        return {
          ...prev,
          coins: nextCoins,
          unlockedRegions: {
            ...(prev.unlockedRegions || {}),
            [item.id]: true,
          },
        };
      }

      // Consumables / boosts / passives / cosmetics
      const currentQty = prev.inventory?.[item.id] || 0;
      updatedQty = currentQty + 1;
      const nextInv = {
        ...(prev.inventory || {}),
        [item.id]: updatedQty,
      };

      return {
        ...prev,
        coins: nextCoins,
        inventory: nextInv,
      };
    });

    return { success: true, item, newQuantity: updatedQty };
  };

  const useItem = (itemId) => {
    if (!itemId) return { success: false, reason: 'invalid_id' };
    const currentQty = progress.inventory?.[itemId] || 0;
    if (currentQty <= 0) {
      return { success: false, reason: 'not_in_inventory' };
    }

    const itemMeta = ITEMS[itemId] || { id: itemId, name: itemId, icon: '📦' };
    let remaining = 0;

    setProgress(prev => {
      const prevQty = prev.inventory?.[itemId] || 0;
      if (prevQty <= 0) return prev;

      const nextInv = { ...(prev.inventory || {}) };
      if (prevQty - 1 <= 0) {
        delete nextInv[itemId];
        remaining = 0;
      } else {
        nextInv[itemId] = prevQty - 1;
        remaining = prevQty - 1;
      }

      return {
        ...prev,
        inventory: nextInv,
      };
    });

    return { success: true, item: itemMeta, remaining };
  };

  const getInventoryList = () => {
    const inv = progress.inventory || {};
    return Object.entries(inv)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([id, qty]) => {
        const meta = ITEMS[id] || {
          id,
          name: id,
          type: 'consumable',
          rarity: 'common',
          description: '',
          icon: '📦',
        };
        return {
          id,
          item_id: id,
          quantity: qty,
          items: {
            ...meta,
            slug: id,
          },
        };
      });
  };

  const unlockRegion = (regionId) => {
    setProgress(prev => ({
      ...prev,
      unlockedRegions: {
        ...(prev.unlockedRegions || {}),
        [regionId]: true,
      },
    }));
  };

  // Battle Token & Medal Actions
  const addBattleTokens = (amount = 1) => setProgress(prev => ({ ...prev, battleTokens: (prev.battleTokens || 0) + amount }));
  const deductBattleTokens = (amount = 5) => setProgress(prev => ({ ...prev, battleTokens: Math.max(0, (prev.battleTokens || 0) - amount) }));
  const setBattleTokens = (amount) => setProgress(prev => ({ ...prev, battleTokens: Math.max(0, amount) }));
  
  const addMedals = ({ gold = 0, silver = 0, bronze = 0 }) => setProgress(prev => ({
    ...prev,
    goldMedals: (prev.goldMedals || 0) + gold,
    silverMedals: (prev.silverMedals || 0) + silver,
    bronzeMedals: (prev.bronzeMedals || 0) + bronze,
  }));

  const isStateLocked = (stateId) => {
    const state = STATES[stateId];
    if (!state) return true;
    if (state.order === 1) return false;
    
    const allStates = Object.values(STATES)
      .filter(s => s.regionId === state.regionId)
      .sort((a, b) => a.order - b.order);
    const prevState = allStates[state.order - 2];
    return prevState ? !progress.completedStates[prevState.id] : true;
  };

  const isRegionLocked = (regionId) => {
    return !progress.unlockedRegions[regionId];
  };

  const getStateProgress = (stateId) => {
    const state = STATES[stateId];
    if (!state) return { solved: 0, total: 5 };
    const solved = state.problems.filter(pid => progress.solvedProblems[pid]).length;
    return { solved, total: state.problems.length };
  };

  const getRegionProgress = (regionId) => {
    const regionStates = Object.values(STATES).filter(s => s.regionId === regionId);
    const totalProblems = regionStates.reduce((acc, s) => acc + s.problems.length, 0);
    const solvedProblems = regionStates.reduce((acc, s) =>
      acc + s.problems.filter(pid => progress.solvedProblems[pid]).length, 0);
    return { solved: solvedProblems, total: totalProblems };
  };

  const resetProgress = () => {
    setProgress(DEFAULT_STATE);
  };

  return (
    <ProgressContext.Provider value={{
      progress,
      markSolved,
      isStateLocked,
      isRegionLocked,
      getStateProgress,
      getRegionProgress,
      resetProgress,
      calculateRewards,
      addCoins,
      spendCoins,
      addBattleTokens,
      deductBattleTokens,
      setBattleTokens,
      addMedals,
      buyItem,
      useItem,
      getInventoryList,
      activateBuff,
      clearBuff,
      isBuffActive,
      unlockRegion,
      awardProblemCoins,
      isProblemRewarded,
      rewardToast,
      clearRewardToast,
      coinTransactions: progress.coinTransactions || [],
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
};

