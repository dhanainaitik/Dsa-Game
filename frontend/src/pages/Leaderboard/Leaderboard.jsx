import { useState, useEffect } from 'react';
import { Trophy, Medal, Zap, Swords, Star, Crown, TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import MedalBadge from '../../components/Battle/MedalBadge';
import { useProgress } from '../../context/ProgressContext';
import { useUser } from '@clerk/clerk-react';
import './Leaderboard.css';

// ── Mock baseline data ──
const LEADERBOARD_DATA = [
  { rank: 1, username: 'ShadowMonarch', level: 87, xp: 47850, coins: 12400, wins: 142, losses: 18, streak: 12, title: 'Monarch', solved: 312, goldMedals: 28, silverMedals: 6, bronzeMedals: 2, medalScore: 160, change: 0 },
  { rank: 2, username: 'CodeSlayer_X', level: 74, xp: 40200, coins: 9800, wins: 118, losses: 22, streak: 7, title: 'Ascendant', solved: 278, goldMedals: 21, silverMedals: 8, bronzeMedals: 3, medalScore: 132, change: 1 },
  { rank: 3, username: 'AlgoHunter', level: 71, xp: 38900, coins: 8200, wins: 103, losses: 29, streak: 3, title: 'Gate Keeper', solved: 251, goldMedals: 17, silverMedals: 11, bronzeMedals: 4, medalScore: 122, change: -1 },
  { rank: 4, username: 'ByteKnight', level: 65, xp: 35100, coins: 7100, wins: 95, losses: 35, streak: 5, title: 'Ascendant', solved: 224, goldMedals: 14, silverMedals: 9, bronzeMedals: 5, medalScore: 102, change: 2 },
  { rank: 5, username: 'RecursionGod', level: 61, xp: 32400, coins: 6500, wins: 88, losses: 41, streak: 0, title: 'Challenger', solved: 198, goldMedals: 12, silverMedals: 7, bronzeMedals: 2, medalScore: 83, change: -2 },
  { rank: 6, username: 'LoopBreaker', level: 58, xp: 29800, coins: 5900, wins: 79, losses: 45, streak: 4, title: 'Challenger', solved: 187, goldMedals: 9, silverMedals: 10, bronzeMedals: 6, medalScore: 81, change: 3 },
  { rank: 7, username: 'NullPointer', level: 54, xp: 27200, coins: 5200, wins: 71, losses: 52, streak: 1, title: 'Duelist', solved: 173, goldMedals: 8, silverMedals: 6, bronzeMedals: 1, medalScore: 59, change: 0 },
  { rank: 8, username: 'Recursio', level: 50, xp: 24600, coins: 4800, wins: 65, losses: 58, streak: 2, title: 'Duelist', solved: 156, goldMedals: 6, silverMedals: 5, bronzeMedals: 3, medalScore: 48, change: -1 },
  { rank: 9, username: 'StackOverflow', level: 47, xp: 22100, coins: 4100, wins: 58, losses: 63, streak: 0, title: 'Ranked', solved: 141, goldMedals: 5, silverMedals: 4, bronzeMedals: 2, medalScore: 39, change: 1 },
  { rank: 10, username: 'BinaryBeast', level: 44, xp: 19800, coins: 3600, wins: 52, losses: 71, streak: 3, title: 'Ranked', solved: 128, goldMedals: 4, silverMedals: 3, bronzeMedals: 1, medalScore: 30, change: 0 },
  { rank: 11, username: 'HeapHero', level: 41, xp: 17500, coins: 3100, wins: 44, losses: 78, streak: 1, title: 'Ranked', solved: 112, goldMedals: 3, silverMedals: 2, bronzeMedals: 0, medalScore: 21, change: 4 },
  { rank: 12, username: 'TreeTraverser', level: 38, xp: 15200, coins: 2800, wins: 38, losses: 84, streak: 0, title: 'Rookie', solved: 98, goldMedals: 2, silverMedals: 1, bronzeMedals: 1, medalScore: 14, change: -2 },
  { rank: 13, username: 'HashHunter', level: 35, xp: 13100, coins: 2400, wins: 33, losses: 90, streak: 2, title: 'Rookie', solved: 87, goldMedals: 1, silverMedals: 2, bronzeMedals: 0, medalScore: 11, change: 0 },
  { rank: 14, username: 'GraphGuru', level: 32, xp: 11200, coins: 2100, wins: 28, losses: 95, streak: 0, title: 'Recruit', solved: 74, goldMedals: 1, silverMedals: 0, bronzeMedals: 2, medalScore: 7, change: 1 },
  { rank: 15, username: 'DpDragon', level: 29, xp: 9400, coins: 1800, wins: 22, losses: 101, streak: 1, title: 'Recruit', solved: 62, goldMedals: 0, silverMedals: 1, bronzeMedals: 1, medalScore: 4, change: -3 },
];

const TABS = ['Battle Ground', 'Arena', 'Problems', 'Wealth'];
const MEDALS = ['🥇', '🥈', '🥉'];

function ChangeIndicator({ change }) {
  if (change > 0) return <span className="lb-change up"><TrendingUp size={12} /> +{change}</span>;
  if (change < 0) return <span className="lb-change down"><TrendingDown size={12} /> {change}</span>;
  return <span className="lb-change flat"><Minus size={12} /></span>;
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('Battle Ground');
  const { progress } = useProgress();
  const { user } = useUser();

  const userMedalScore = (progress.goldMedals || 0) * 5 + (progress.silverMedals || 0) * 3 + (progress.bronzeMedals || 0);

  const playerEntry = {
    rank: 42,
    username: user?.username || user?.fullName || 'You',
    level: progress.level || 1,
    xp: progress.xp || 0,
    coins: progress.coins || 100,
    wins: 12,
    losses: 21,
    streak: 0,
    title: 'Recruit Hunter',
    solved: Object.keys(progress.solvedProblems || {}).length || 0,
    goldMedals: progress.goldMedals || 0,
    silverMedals: progress.silverMedals || 0,
    bronzeMedals: progress.bronzeMedals || 0,
    medalScore: userMedalScore,
    change: 2,
    isMe: true,
  };

  const sortedData = [...LEADERBOARD_DATA].sort((a, b) => {
    if (activeTab === 'Battle Ground') return b.medalScore - a.medalScore;
    if (activeTab === 'Problems') return b.solved - a.solved;
    if (activeTab === 'Wealth') return b.coins - a.coins;
    return a.rank - b.rank; // Arena = wins-based rank
  });

  return (
    <div className="lb-page animate-fadeIn">
      <PageHeader
        title="ASCENDANTS BOARD"
        description="The top hunters ranked by tournament medals, arena victories, problems slain, and coins accumulated."
      />

      <div className="container lb-body">
        {/* Top 3 podium */}
        <div className="lb-podium">
          {/* 2nd */}
          <div className="lb-podium-card second">
            <div className="lb-podium-rank">🥈</div>
            <div className="lb-podium-avatar">{sortedData[1]?.username[0]}</div>
            <div className="lb-podium-name">{sortedData[1]?.username}</div>
            <div className="lb-podium-title">{sortedData[1]?.title}</div>
            <div className="lb-podium-stat">
              {activeTab === 'Battle Ground' ? (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <span>🥇 {sortedData[1]?.goldMedals}</span>
                  <span>🥈 {sortedData[1]?.silverMedals}</span>
                </div>
              ) : activeTab === 'Wealth' ? (
                `${sortedData[1]?.coins.toLocaleString()} G`
              ) : activeTab === 'Problems' ? (
                `${sortedData[1]?.solved} solved`
              ) : (
                `${sortedData[1]?.wins}W`
              )}
            </div>
            <div className="lb-podium-block second-block" />
          </div>

          {/* 1st */}
          <div className="lb-podium-card first">
            <div className="lb-crown"><Crown size={28} fill="#FFD600" color="#000" /></div>
            <div className="lb-podium-rank">🥇</div>
            <div className="lb-podium-avatar gold">{sortedData[0]?.username[0]}</div>
            <div className="lb-podium-name">{sortedData[0]?.username}</div>
            <div className="lb-podium-title">{sortedData[0]?.title}</div>
            <div className="lb-podium-stat">
              {activeTab === 'Battle Ground' ? (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', fontWeight: 900 }}>
                  <span>🥇 {sortedData[0]?.goldMedals}</span>
                  <span>🥈 {sortedData[0]?.silverMedals}</span>
                </div>
              ) : activeTab === 'Wealth' ? (
                `${sortedData[0]?.coins.toLocaleString()} G`
              ) : activeTab === 'Problems' ? (
                `${sortedData[0]?.solved} solved`
              ) : (
                `${sortedData[0]?.wins}W`
              )}
            </div>
            <div className="lb-podium-block first-block" />
          </div>

          {/* 3rd */}
          <div className="lb-podium-card third">
            <div className="lb-podium-rank">🥉</div>
            <div className="lb-podium-avatar">{sortedData[2]?.username[0]}</div>
            <div className="lb-podium-name">{sortedData[2]?.username}</div>
            <div className="lb-podium-title">{sortedData[2]?.title}</div>
            <div className="lb-podium-stat">
              {activeTab === 'Battle Ground' ? (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <span>🥇 {sortedData[2]?.goldMedals}</span>
                  <span>🥈 {sortedData[2]?.silverMedals}</span>
                </div>
              ) : activeTab === 'Wealth' ? (
                `${sortedData[2]?.coins.toLocaleString()} G`
              ) : activeTab === 'Problems' ? (
                `${sortedData[2]?.solved} solved`
              ) : (
                `${sortedData[2]?.wins}W`
              )}
            </div>
            <div className="lb-podium-block third-block" />
          </div>
        </div>

        {/* Tab nav */}
        <div className="lb-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`lb-tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'Battle Ground' && <Flame size={15} color="#ef4444" />}
              {t === 'Arena' && <Swords size={15} />}
              {t === 'Problems' && <Star size={15} />}
              {t === 'Wealth' && <Zap size={15} />}
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="lb-table-wrap">
          <div className="lb-table-header">
            <div className="lb-col rank">#</div>
            <div className="lb-col player">HUNTER</div>
            <div className="lb-col level">LVL</div>
            <div className="lb-col stat">
              {activeTab === 'Battle Ground'
                ? 'MEDALS & SCORE'
                : activeTab === 'Wealth'
                ? 'COINS'
                : activeTab === 'Problems'
                ? 'SOLVED'
                : 'W / L'}
            </div>
            <div className="lb-col streak">
              {activeTab === 'Battle Ground' ? 'GOLD MEDALS' : 'STREAK'}
            </div>
            <div className="lb-col change">CHANGE</div>
          </div>

          {sortedData.map((player, i) => (
            <div
              key={player.username}
              className={`lb-row ${i < 3 ? 'top3' : ''} ${player.isMe ? 'is-me' : ''}`}
            >
              <div className="lb-col rank">
                {i < 3 ? <span className="lb-medal">{MEDALS[i]}</span> : <span className="lb-rank-num">{i + 1}</span>}
              </div>
              <div className="lb-col player">
                <div className="lb-avatar">{player.username[0]}</div>
                <div>
                  <div className="lb-username">{player.username}</div>
                  <div className="lb-title-tag">{player.title}</div>
                </div>
              </div>
              <div className="lb-col level">
                <span className="lb-lvl-chip">LVL {player.level}</span>
              </div>
              <div className="lb-col stat lb-stat-val">
                {activeTab === 'Battle Ground' ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, color: '#facc15' }}>{player.medalScore} pts</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      (🥇{player.goldMedals} 🥈{player.silverMedals})
                    </span>
                  </div>
                ) : activeTab === 'Wealth' ? (
                  `${player.coins.toLocaleString()} G`
                ) : activeTab === 'Problems' ? (
                  player.solved
                ) : (
                  `${player.wins} / ${player.losses}`
                )}
              </div>
              <div className="lb-col streak">
                {activeTab === 'Battle Ground' ? (
                  <MedalBadge type="gold" count={player.goldMedals} size="sm" showZero />
                ) : player.streak > 0 ? (
                  <span className="lb-streak">🔥 {player.streak}</span>
                ) : (
                  <span className="lb-streak-none">—</span>
                )}
              </div>
              <div className="lb-col change">
                <ChangeIndicator change={player.change} />
              </div>
            </div>
          ))}

          {/* Your position separator */}
          <div className="lb-separator">· · · YOUR POSITION · · ·</div>
          <div className="lb-row is-me">
            <div className="lb-col rank"><span className="lb-rank-num">{playerEntry.rank}</span></div>
            <div className="lb-col player">
              <div className="lb-avatar me">{playerEntry.username[0]}</div>
              <div>
                <div className="lb-username">{playerEntry.username}</div>
                <div className="lb-title-tag">{playerEntry.title}</div>
              </div>
            </div>
            <div className="lb-col level"><span className="lb-lvl-chip">LVL {playerEntry.level}</span></div>
            <div className="lb-col stat lb-stat-val">
              {activeTab === 'Battle Ground' ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontWeight: 900, color: '#facc15' }}>{playerEntry.medalScore} pts</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    (🥇{playerEntry.goldMedals} 🥈{playerEntry.silverMedals})
                  </span>
                </div>
              ) : activeTab === 'Wealth' ? (
                `${playerEntry.coins.toLocaleString()} G`
              ) : activeTab === 'Problems' ? (
                playerEntry.solved
              ) : (
                `${playerEntry.wins} / ${playerEntry.losses}`
              )}
            </div>
            <div className="lb-col streak">
              {activeTab === 'Battle Ground' ? (
                <MedalBadge type="gold" count={playerEntry.goldMedals} size="sm" showZero />
              ) : (
                <span className="lb-streak-none">—</span>
              )}
            </div>
            <div className="lb-col change"><ChangeIndicator change={playerEntry.change} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
