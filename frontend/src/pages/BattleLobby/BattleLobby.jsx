import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Swords, Zap, Activity, Flame, Trophy, Crown,
  ShieldAlert, Lock, ArrowRight, Shield, Target, Star
} from 'lucide-react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import { useProgress } from '../../context/ProgressContext';
import { useUser } from '@clerk/clerk-react';
import BattleTokenCounter from '../../components/Battle/BattleTokenCounter';
import MedalBadge from '../../components/Battle/MedalBadge';
import './BattleLobby.css';

/* ─── Mode Definitions ───────────────────────────────────────────────────── */
const NORMAL_MODES = [
  {
    id: '1v1',
    num: '01',
    Icon: Swords,
    title: '1V1 DUEL',
    subtitle: 'SOLO VS SOLO',
    description: 'Pure individual skill. Solve faster. Deal more damage.',
    accentClass: 'card-red',
    players: '2 PLAYERS',
    badge: '+1 TOKEN',
    cta: 'FIND MATCH',
    indicator: 'RANKED',
    isPrimary: true,
  },
  {
    id: 'duo',
    num: '02',
    Icon: Users,
    title: 'DUO MODE',
    subtitle: 'CO-OP',
    description: 'Team up and solve the challenge together.',
    accentClass: 'card-yellow',
    players: '2 PLAYERS',
    badge: 'CO-OP',
    cta: 'FIND TEAMMATE',
    indicator: 'COOPERATIVE',
    isPrimary: false,
  },
  {
    id: '2v2',
    num: '03',
    Icon: Shield,
    title: '2V2 BATTLE',
    subtitle: 'TEAM VS TEAM',
    description: 'Coordinate attacks and dominate the opposing team.',
    accentClass: 'card-orange',
    players: '4 PLAYERS',
    badge: '+1 TOKEN',
    cta: 'FIND MATCH',
    indicator: 'RANKED',
    isPrimary: false,
  },
];

const BATTLE_GROUND_MODES = [
  {
    id: 'bg_1v1',
    num: 'I',
    Icon: Flame,
    title: '1V1 BATTLE GROUND',
    subtitle: 'CHAMPIONSHIP DUEL',
    description: 'Premier elimination duel. Hard/Master problem pool. Winner earns 🥇 Gold Medal, 500 Coins, 1000 XP.',
    accentClass: 'card-crimson',
    players: '2 WARRIORS',
    badge: '🥇 GOLD / 🥈 SILVER',
    cta: 'ENTER BATTLE GROUND',
    cost: '5 TOKENS',
  },
  {
    id: 'bg_2v2',
    num: 'II',
    Icon: Crown,
    title: '2V2 BATTLE GROUND',
    subtitle: 'ELITE SQUAD WARS',
    description: '4-player high-stakes elimination. Team combos, synchronized coding. Winning squad claims 🥇 Gold Medals.',
    accentClass: 'card-gold',
    players: '4 WARRIORS',
    badge: '🥇 SQUAD MEDALS',
    cta: 'ENTER BATTLE GROUND',
    cost: '5 TOKENS',
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function BattleLobby() {
  const navigate = useNavigate();
  const { progress } = useProgress();
  const { user } = useUser();
  const {
    status,
    mode,
    room,
    queueSize,
    isBattleGround,
    tokenError,
    findMatch,
    findBattleGroundMatch,
    cancelSearch,
  } = useMultiplayer();

  const [activeTab, setActiveTab] = useState('normal'); // 'normal' | 'battleground'
  const [selectedMode, setSelectedMode] = useState(null);

  const userTokens = progress?.battleTokens || 0;
  const hasEntryTokens = userTokens >= 5;

  // Navigate to arena when match becomes active
  useEffect(() => {
    if (status === 'active' && room) {
      if (room.isBattleGround || isBattleGround) {
        navigate('/battleground/' + room.roomId, { state: { room } });
      } else {
        navigate('/battle/' + room.roomId, { state: { room } });
      }
    }
  }, [status, room, isBattleGround, navigate]);

  const handleQueueBattleGround = (bgModeId) => {
    if (!hasEntryTokens) return;
    findBattleGroundMatch(bgModeId);
  };

  const handleFindMatch = (modeId) => {
    setSelectedMode(modeId);
    findMatch(modeId);
  };

  // Derive total wins from medals (a useful stat to show)
  const totalMedals = (progress?.goldMedals || 0) + (progress?.silverMedals || 0) + (progress?.bronzeMedals || 0);

  return (
    <div className="arena-page">
      {/* Animated dot grid background */}
      <div className="arena-bg-grid" />
      {/* Diagonal accent stripe */}
      <div className="arena-bg-stripe" />

      <div className="arena-inner">

        {/* ── Premium Arena Header ──────────────────────────────────────────── */}
        <header className="arena-hero">
          <div className="arena-hero-live">
            <span className="arena-live-dot" />
            LIVE COMPETITION
          </div>
          <div className="arena-hero-headline">
            <h1 className="arena-hero-title">
              BATTLE<br />
              <span className="arena-hero-title-accent">ARENA</span>
            </h1>
            <div className="arena-hero-right">
              <p className="arena-hero-tagline">
                PROVE YOUR CODE.<br />DEFEAT YOUR OPPONENTS.
              </p>
              <div className="arena-hero-divider" />
              <div className="arena-hero-meta">
                <div className="arena-hero-meta-item">
                  <span className="arena-hero-meta-val">3</span>
                  <span className="arena-hero-meta-lbl">GAME MODES</span>
                </div>
                <div className="arena-hero-meta-sep" />
                <div className="arena-hero-meta-item">
                  <span className="arena-hero-meta-val">5</span>
                  <span className="arena-hero-meta-lbl">TOKENS TO GLORY</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Profile + Token Row ───────────────────────────────────────────── */}
        <section className="arena-vitals">
          {/* Competitive Profile HUD */}
          <div className="profile-hud">
            <div className="profile-hud-avatar-wrap">
              <div className="profile-hud-avatar">
                {(user?.username || user?.fullName || 'P')[0].toUpperCase()}
              </div>
              <div className="profile-hud-level-ring">
                LVL {progress?.level || 1}
              </div>
            </div>
            <div className="profile-hud-info">
              <div className="profile-hud-name">
                {user?.username || user?.fullName || 'Hunter'}
              </div>
              <div className="profile-hud-rank-row">
                <span className="profile-hud-rank-chip">RANK #{progress?.level || 1}</span>
                {totalMedals > 0 && (
                  <span className="profile-hud-wins-chip">{totalMedals} MEDALS</span>
                )}
              </div>
              <div className="profile-hud-medals">
                <MedalBadge type="gold"   count={progress?.goldMedals   || 0} size="sm" showZero />
                <MedalBadge type="silver" count={progress?.silverMedals || 0} size="sm" showZero />
                <MedalBadge type="bronze" count={progress?.bronzeMedals || 0} size="sm" showZero />
              </div>
            </div>
            <div className="profile-hud-stats">
              <div className="profile-stat">
                <span className="profile-stat-val">{progress?.coins || 0}</span>
                <span className="profile-stat-lbl">COINS</span>
              </div>
              <div className="profile-stat-divider" />
              <div className="profile-stat">
                <span className="profile-stat-val">{progress?.xp || 0}</span>
                <span className="profile-stat-lbl">XP</span>
              </div>
              <div className="profile-stat-divider" />
              <div className="profile-stat">
                <span className="profile-stat-val">{userTokens}</span>
                <span className="profile-stat-lbl">TOKENS</span>
              </div>
            </div>
          </div>

          {/* Battle Token Block */}
          <div className="token-block">
            <BattleTokenCounter tokens={userTokens} maxTokens={5} size="md" />
          </div>

          {/* Battle Ground Status */}
          <div className={`bg-status-chip ${hasEntryTokens ? 'unlocked' : 'locked'}`}>
            {hasEntryTokens ? (
              <>
                <div className="bg-status-icon-wrap unlocked-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                </div>
                <div className="bg-status-text">
                  <div className="bg-status-title">BATTLE GROUND READY</div>
                  <div className="bg-status-sub">5 / 5 TOKENS · ENTRY AVAILABLE</div>
                </div>
                <button
                  className="bg-status-cta"
                  onClick={() => setActiveTab('battleground')}
                >
                  ENTER <ArrowRight size={12} />
                </button>
              </>
            ) : (
              <>
                <div className="bg-status-icon-wrap locked-icon">
                  <Lock size={20} />
                </div>
                <div className="bg-status-text">
                  <div className="bg-status-title">BATTLE GROUND LOCKED</div>
                  <div className="bg-status-sub">{userTokens} / 5 TOKENS · {5 - userTokens} WINS NEEDED</div>
                </div>
                <div className="bg-status-progress">
                  <div
                    className="bg-status-progress-fill"
                    style={{ width: `${(userTokens / 5) * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* Token error */}
        {tokenError && (
          <motion.div
            className="arena-token-error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShieldAlert size={15} />
            <span>{tokenError}</span>
          </motion.div>
        )}

        {/* ── Tab Navigation ────────────────────────────────────────────────── */}
        {status === 'idle' && (
          <div className="arena-tabs">
            <button
              id="tab-normal"
              className={`arena-tab ${activeTab === 'normal' ? 'active' : ''}`}
              onClick={() => setActiveTab('normal')}
            >
              <Swords size={15} />
              NORMAL PvP
              <span className="arena-tab-pill">EARN TOKENS</span>
            </button>
            <button
              id="tab-battleground"
              className={`arena-tab arena-tab-bg ${activeTab === 'battleground' ? 'active' : ''} ${hasEntryTokens ? 'tab-unlocked' : 'tab-locked'}`}
              onClick={() => setActiveTab('battleground')}
            >
              <Flame size={15} />
              BATTLE GROUND
              <span className="arena-tab-pill pill-bg">
                {hasEntryTokens ? '⚡ READY' : `🔒 ${userTokens}/5`}
              </span>
            </button>
          </div>
        )}

        {/* ── Content Area ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* Normal PvP Modes */}
          {status === 'idle' && activeTab === 'normal' && (
            <motion.div
              key="normal"
              className="mode-section"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mode-section-header">
                <span className="mode-section-label">CHOOSE YOUR BATTLE</span>
                <span className="mode-section-count">3 MODES AVAILABLE</span>
              </div>
              <div className="mode-grid">
                {NORMAL_MODES.map((card, i) => (
                  <motion.button
                    key={card.id}
                    id={`mode-card-${card.id}`}
                    className={`mode-card ${card.accentClass} ${card.isPrimary ? 'mode-card-primary' : ''} ${selectedMode === card.id ? 'mode-card-selected' : ''}`}
                    onClick={() => handleFindMatch(card.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -6, transition: { duration: 0.15 } }}
                  >
                    {/* Mode number overlay */}
                    <div className="mode-card-num">{card.num}</div>

                    {/* Primary badge for 1v1 */}
                    {card.isPrimary && (
                      <div className="mode-card-primary-badge">PRIMARY MODE</div>
                    )}

                    <div className="mode-card-top">
                      <div className="mode-card-icon-wrap">
                        <card.Icon size={28} />
                      </div>
                      <div className="mode-card-badges">
                        <span className="mode-badge mode-badge-players">{card.players}</span>
                        <span className="mode-badge mode-badge-indicator">{card.indicator}</span>
                      </div>
                    </div>
                    <div className="mode-card-body">
                      <div className="mode-card-title">{card.title}</div>
                      <div className="mode-card-subtitle">{card.subtitle}</div>
                      <p className="mode-card-desc">{card.description}</p>
                    </div>
                    <div className="mode-card-footer">
                      <span className="mode-reward-chip">{card.badge}</span>
                      <span className="mode-cta-btn">
                        {card.cta}
                        <span className="mode-cta-arrow">→</span>
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Battle Ground Modes */}
          {status === 'idle' && activeTab === 'battleground' && (
            <motion.div
              key="battleground"
              className="bg-section"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              {/* Banner */}
              <div className={`bg-tournament-banner ${hasEntryTokens ? 'banner-ready' : 'banner-locked'}`}>
                <div className="bg-banner-left">
                  <div className="bg-banner-tag">
                    <Trophy size={13} /> APEX TOURNAMENT ARENA
                  </div>
                  <h2 className="bg-banner-heading">ENTER THE BATTLE GROUND</h2>
                  <p className="bg-banner-desc">
                    Entry fee: <strong>5 Battle Tokens</strong>. Hard problem pool, sudden death elimination, and permanent 🥇 Gold / 🥈 Silver medals for champions.
                  </p>
                </div>
                {!hasEntryTokens && (
                  <div className="bg-banner-locked-msg">
                    <Lock size={20} />
                    <div>
                      <div className="bg-lock-title">ENTRY LOCKED</div>
                      <div className="bg-lock-sub">Win {5 - userTokens} more PvP battle{5 - userTokens !== 1 ? 's' : ''}</div>
                    </div>
                    <button
                      className="bg-go-pvp-btn"
                      onClick={() => setActiveTab('normal')}
                    >
                      PLAY NORMAL PvP <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* BG Mode Cards */}
              <div className="mode-grid mode-grid-2">
                {BATTLE_GROUND_MODES.map((card, i) => (
                  <motion.button
                    key={card.id}
                    id={`mode-card-${card.id}`}
                    className={`mode-card ${card.accentClass} bg-mode-card ${!hasEntryTokens ? 'mode-card-disabled' : ''}`}
                    onClick={() => handleQueueBattleGround(card.id)}
                    disabled={!hasEntryTokens}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={hasEntryTokens ? { y: -6, transition: { duration: 0.15 } } : {}}
                  >
                    {/* Mode number overlay */}
                    <div className="mode-card-num">{card.num}</div>

                    <div className="mode-card-top">
                      <div className="mode-card-icon-wrap">
                        <card.Icon size={28} />
                      </div>
                      <div className="mode-card-badges">
                        <span className="mode-badge mode-badge-players">{card.players}</span>
                        <span className="mode-badge mode-badge-cost">{card.cost}</span>
                      </div>
                    </div>
                    <div className="mode-card-body">
                      <div className="mode-card-title">{card.title}</div>
                      <div className="mode-card-subtitle">{card.subtitle}</div>
                      <p className="mode-card-desc">{card.description}</p>
                    </div>
                    <div className="mode-card-footer">
                      <span className="mode-reward-chip reward-chip-gold">{card.badge}</span>
                      <span className={`mode-cta-btn ${!hasEntryTokens ? 'cta-locked' : 'cta-bg'}`}>
                        {hasEntryTokens
                          ? <>{card.cta} <span className="mode-cta-arrow">→</span></>
                          : '🔒 LOCKED'}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Matchmaking Queue ─────────────────────────────────────────── */}
          {status === 'searching' && (
            <motion.div
              key="searching"
              className={`mm-panel ${isBattleGround ? 'mm-panel-bg' : ''}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mm-spinner-ring">
                <Activity size={36} className="mm-spin-icon" />
              </div>
              <div className="mm-search-tag">
                {isBattleGround ? '⚔️ BATTLE GROUND TOURNAMENT' : 'STANDARD MATCHMAKING'}
              </div>
              <div className="mm-search-title">
                {isBattleGround
                  ? mode === 'bg_1v1' ? 'SEARCHING FOR DUEL OPPONENT' : 'ASSEMBLING SQUAD TEAMS'
                  : mode === '1v1' ? 'FINDING OPPONENT'
                  : mode === 'duo' ? 'FINDING CO-OP PARTNER'
                  : 'ASSEMBLING TEAMS'}
              </div>
              <div className="mm-slots">
                {[...Array(mode === '2v2' || mode === 'bg_2v2' ? 4 : 2)].map((_, i) => (
                  <div
                    key={i}
                    className={`mm-slot ${i === 0 ? 'slot-me' : i < queueSize ? 'slot-filled' : 'slot-empty'}`}
                  >
                    {i === 0 ? (user?.username || 'P')[0].toUpperCase() : i < queueSize ? '?' : '+'}
                  </div>
                ))}
              </div>
              <div className="mm-queue-count">
                {queueSize}/{mode === '2v2' || mode === 'bg_2v2' ? 4 : 2} PLAYERS IN QUEUE
              </div>
              <button className="mm-cancel-btn" onClick={cancelSearch}>
                Cancel Search
              </button>
            </motion.div>
          )}

          {/* ── Match Found ───────────────────────────────────────────────── */}
          {status === 'found' && (
            <motion.div
              key="found"
              className={`mm-panel mm-panel-found ${isBattleGround ? 'mm-panel-bg-found' : ''}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <div className="mm-found-badge">
                {isBattleGround ? '🔥 BATTLE GROUND MATCH READY' : '⚡ MATCH FOUND'}
              </div>
              <div className="mm-search-title">
                {isBattleGround ? 'COMMENCING TOURNAMENT' : 'PREPARING ARENA'}
              </div>
              <p className="mm-found-sub">Deducting tokens and establishing secure combat grid...</p>
              <div className="mm-progress-bar">
                <motion.div
                  className="mm-progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
