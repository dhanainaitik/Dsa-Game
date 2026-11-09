const supabase = require('../utils/supabase');

/**
 * battleGroundService.js
 * Handles Battle Tokens, Battle Ground entry validation, atomic deduction,
 * match logging, and Medal rewards.
 */

class BattleGroundService {
  /**
   * Securely awards +1 Battle Token to normal PvP winners and updates match stats.
   * @param {string} roomId
   * @param {string[]} winnerClerkIds
   * @param {string[]} loserClerkIds
   */
  async awardPvPWinToken(roomId, winnerClerkIds = [], loserClerkIds = []) {
    if (!winnerClerkIds.length) return { success: false, reason: 'no_winners' };

    try {
      // 1. Try atomic PostgreSQL RPC first
      const { data: rpcData, error: rpcError } = await supabase.rpc('award_pvp_win_token', {
        p_room_id: roomId,
        p_winner_clerk_ids: winnerClerkIds,
        p_loser_clerk_ids: loserClerkIds,
      });

      if (!rpcError && rpcData?.success) {
        console.log(`[BattleGroundService] Token awarded via RPC for room ${roomId}`);
        return { success: true, rpc: true };
      }

      // 2. Fallback direct update (handles environments where migration hasn't been executed in SQL Editor yet)
      console.log(`[BattleGroundService] Using direct Supabase update for room ${roomId}`);

      for (const clerkId of winnerClerkIds) {
        if (!clerkId) continue;
        const { data: profile } = await supabase
          .from('player_profiles')
          .select('battle_tokens, battles_won, total_battles')
          .eq('clerk_id', clerkId)
          .single();

        const currentTokens = profile?.battle_tokens || 0;
        const won = (profile?.battles_won || 0) + 1;
        const total = (profile?.total_battles || 0) + 1;

        await supabase
          .from('player_profiles')
          .update({
            battle_tokens: currentTokens + 1,
            battles_won: won,
            total_battles: total,
          })
          .eq('clerk_id', clerkId);
      }

      for (const clerkId of loserClerkIds) {
        if (!clerkId) continue;
        const { data: profile } = await supabase
          .from('player_profiles')
          .select('battles_lost, total_battles')
          .eq('clerk_id', clerkId)
          .single();

        const lost = (profile?.battles_lost || 0) + 1;
        const total = (profile?.total_battles || 0) + 1;

        await supabase
          .from('player_profiles')
          .update({
            battles_lost: lost,
            total_battles: total,
          })
          .eq('clerk_id', clerkId);
      }

      return { success: true };
    } catch (err) {
      console.error('[BattleGroundService] awardPvPWinToken error:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Verifies if a user has at least 5 Battle Tokens to enter Battle Ground.
   * @param {string} clerkId
   */
  async checkBattleTokens(clerkId) {
    if (!clerkId) return { hasEnough: false, battleTokens: 0 };
    try {
      const { data, error } = await supabase
        .from('player_profiles')
        .select('battle_tokens')
        .eq('clerk_id', clerkId)
        .single();

      if (error || !data) {
        return { hasEnough: false, battleTokens: 0 };
      }

      const tokens = data.battle_tokens || 0;
      return {
        hasEnough: tokens >= 5,
        battleTokens: tokens,
      };
    } catch (err) {
      console.error('[BattleGroundService] checkBattleTokens error:', err.message);
      return { hasEnough: false, battleTokens: 0 };
    }
  }

  /**
   * Atomically deducts 5 Battle Tokens from all participants upon Battle Ground match formation.
   * @param {string[]} clerkIds
   */
  async deductEntryTokens(clerkIds = []) {
    if (!clerkIds.length) return { success: false, reason: 'no_players' };

    try {
      // 1. Try atomic RPC first
      const { data: rpcData, error: rpcError } = await supabase.rpc('deduct_battle_ground_entry', {
        p_clerk_ids: clerkIds,
      });

      if (!rpcError && Array.isArray(rpcData) && rpcData.length === clerkIds.length) {
        const balances = {};
        rpcData.forEach((row) => {
          balances[row.clerk_id] = row.remaining_tokens;
        });
        return { success: true, balances };
      }

      // 2. Direct fallback check and update
      const { data: profiles, error: fetchErr } = await supabase
        .from('player_profiles')
        .select('clerk_id, battle_tokens')
        .in('clerk_id', clerkIds);

      if (fetchErr || !profiles || profiles.length !== clerkIds.length) {
        return { success: false, reason: 'could_not_verify_all_players' };
      }

      // Check all have >= 5
      for (const p of profiles) {
        if ((p.battle_tokens || 0) < 5) {
          return { success: false, reason: 'insufficient_tokens', failedClerkId: p.clerk_id };
        }
      }

      // Deduct 5 tokens for each
      const balances = {};
      for (const p of profiles) {
        const newBalance = Math.max(0, (p.battle_tokens || 0) - 5);
        await supabase
          .from('player_profiles')
          .update({ battle_tokens: newBalance })
          .eq('clerk_id', p.clerk_id);
        balances[p.clerk_id] = newBalance;
      }

      return { success: true, balances };
    } catch (err) {
      console.error('[BattleGroundService] deductEntryTokens error:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Records a completed Battle Ground match and awards Gold / Silver medals.
   * @param {Object} params
   * @param {string} params.roomId
   * @param {string} params.mode - 'bg_1v1' or 'bg_2v2'
   * @param {string} params.problemId
   * @param {string} params.winnerTeam - 'A' or 'B'
   * @param {Array<{ clerkId: string, team: string, damageDealt: number, correctness: number }>} params.participants
   */
  async recordBattleGroundMatch({ roomId, mode, problemId, winnerTeam, participants = [] }) {
    try {
      // 1. Insert match row
      const dbMode = mode === 'bg_2v2' ? 'BG_2V2' : 'BG_1V1';
      let matchId = null;

      try {
        const { data: matchData, error: matchError } = await supabase
          .from('battle_ground_matches')
          .insert({
            room_id: roomId,
            mode: dbMode,
            problem_id: problemId || 'tournament-1',
            winner_team: winnerTeam,
          })
          .select('id')
          .single();

        if (!matchError && matchData) {
          matchId = matchData.id;
        }
      } catch (e) {
        // Table might not exist yet if migration pending; proceed with profile medal updates
      }

      // 2. Award medals to players and insert participants
      const medalsAwarded = {};

      for (const p of participants) {
        const isWinner = p.team === winnerTeam;
        const medal = isWinner ? 'GOLD' : 'SILVER';
        medalsAwarded[p.clerkId] = medal;

        // Update player medals count
        try {
          const { data: profile } = await supabase
            .from('player_profiles')
            .select('gold_medals, silver_medals')
            .eq('clerk_id', p.clerkId)
            .single();

          if (profile) {
            const updates = {};
            if (isWinner) {
              updates.gold_medals = (profile.gold_medals || 0) + 1;
            } else {
              updates.silver_medals = (profile.silver_medals || 0) + 1;
            }
            await supabase
              .from('player_profiles')
              .update(updates)
              .eq('clerk_id', p.clerkId);
          }
        } catch (err) {
          console.warn('[BattleGroundService] Profile medal update failed:', err.message);
        }

        // Insert participant log if table exists
        if (matchId) {
          try {
            await supabase.from('battle_ground_participants').insert({
              match_id: matchId,
              clerk_id: p.clerkId,
              team: p.team,
              damage_dealt: p.damageDealt || 0,
              correctness: p.correctness || 0,
              medal_awarded: medal,
              tokens_spent: 5,
            });
          } catch (e) {
            // Ignore if participant log fails
          }
        }
      }

      return { success: true, medals: medalsAwarded };
    } catch (err) {
      console.error('[BattleGroundService] recordBattleGroundMatch error:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Retrieves player's Battle Ground stats and medal collection.
   * @param {string} clerkId
   */
  async getPlayerBattleStats(clerkId) {
    if (!clerkId) return null;
    try {
      const { data, error } = await supabase
        .from('player_profiles')
        .select('battle_tokens, gold_medals, silver_medals, bronze_medals, battles_won, battles_lost, total_battles, rank, level')
        .eq('clerk_id', clerkId)
        .single();

      if (error || !data) return null;

      const medalPoints =
        (data.gold_medals || 0) * 5 +
        (data.silver_medals || 0) * 3 +
        (data.bronze_medals || 0) * 1;

      return {
        battleTokens: data.battle_tokens || 0,
        goldMedals: data.gold_medals || 0,
        silverMedals: data.silver_medals || 0,
        bronzeMedals: data.bronze_medals || 0,
        medalPoints,
        battlesWon: data.battles_won || 0,
        battlesLost: data.battles_lost || 0,
        totalBattles: data.total_battles || 0,
        winRate: data.total_battles > 0 ? Math.round((data.battles_won / data.total_battles) * 100) : 0,
      };
    } catch (err) {
      console.error('[BattleGroundService] getPlayerBattleStats error:', err);
      return null;
    }
  }

  /**
   * Retrieves top players ordered by Battle Ground medal score.
   */
  async getMedalLeaderboard(limit = 25) {
    try {
      const { data, error } = await supabase
        .from('player_profiles')
        .select('clerk_id, username, avatar_url, level, rank, title, gold_medals, silver_medals, bronze_medals, battles_won')
        .order('gold_medals', { ascending: false })
        .order('silver_medals', { ascending: false })
        .order('bronze_medals', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map((player, index) => ({
        rank: index + 1,
        username: player.username || 'Hunter',
        avatarUrl: player.avatar_url,
        level: player.level || 1,
        title: player.title || 'Ascendant',
        goldMedals: player.gold_medals || 0,
        silverMedals: player.silver_medals || 0,
        bronzeMedals: player.bronze_medals || 0,
        medalScore: (player.gold_medals || 0) * 5 + (player.silver_medals || 0) * 3 + (player.bronze_medals || 0),
        battlesWon: player.battles_won || 0,
      }));
    } catch (err) {
      console.error('[BattleGroundService] getMedalLeaderboard error:', err);
      return [];
    }
  }
}

module.exports = new BattleGroundService();
