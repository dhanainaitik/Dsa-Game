import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useProgress } from '../../context/ProgressContext';
import { useNavigate } from 'react-router-dom';
import {
  Map, Zap, Award, ShoppingCart, Swords, ChevronRight, Star, ArrowRight,
  Terminal, History, Lock, Edit3, Save, Camera, User, Shield,
  Target, BookOpen, Trophy, CheckCircle2, Flame
} from 'lucide-react';
import { REGIONS } from '../../data/regions';
import BattleTokenCounter from '../../components/Battle/BattleTokenCounter';
import MedalBadge from '../../components/Battle/MedalBadge';
import './Dashboard.css';

export default function Dashboard() {
  const { isLoaded, user } = useUser();
  const { progress, getRegionProgress } = useProgress();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [editName, setEditName] = useState('');
  const [editGuild, setEditGuild] = useState('SOLO LEVELING SQD');
  const [editBio, setEditBio] = useState('Just a hunter trying to clear the S-Rank dungeons before lunch.');
  const [saved, setSaved] = useState(false);

  if (!isLoaded) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
      </div>
    );
  }

  const displayName = user?.fullName || user?.username || 'Hunter';
  const level = progress?.level || 1;
  const xp = progress?.xp || 0;
  const coins = progress?.coins || 0;
  const battleTokens = progress?.battleTokens || 0;
  const goldMedals = progress?.goldMedals || 0;
  const silverMedals = progress?.silverMedals || 0;
  const bronzeMedals = progress?.bronzeMedals || 0;
  const medalScore = goldMedals * 5 + silverMedals * 3 + bronzeMedals * 1;
  const xpProgress = ((xp % 550) / 550) * 100;
  const totalSolved = Object.keys(progress.solvedProblems || {}).length;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'edit', label: 'Edit Profile', icon: Edit3 },
    { id: 'progress', label: 'Progress', icon: BookOpen },
  ];

  return (
    <div className="dashboard-root animate-fadeIn">

      {/* ── HERO BANNER ── */}
      <div className="dash-banner">
        <div className="dash-banner-pattern" />
        <div className="container dash-banner-inner">
          <div className="dash-avatar-block">
            <div className="dash-avatar-wrap">
              <img
                src={user?.imageUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayName}`}
                alt="avatar"
                className="dash-avatar-img"
              />
              <div className="dash-lvl-badge">LVL {level}</div>
            </div>
            <div className="dash-avatar-info">
              <div className="dash-eyebrow">HUNTER PROFILE</div>
              <h1 className="dash-name">{displayName.toUpperCase()}</h1>
              <div className="dash-guild">{editGuild}</div>
              <div className="dash-bio-short">{editBio}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <MedalBadge type="gold" count={goldMedals} size="sm" showZero />
                <MedalBadge type="silver" count={silverMedals} size="sm" showZero />
                <MedalBadge type="bronze" count={bronzeMedals} size="sm" showZero />
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="dash-quick-stats">
            <div className="dash-qs">
              <div className="dash-qs-val">{totalSolved}</div>
              <div className="dash-qs-label">Solved</div>
            </div>
            <div className="dash-qs-div" />
            <div className="dash-qs">
              <div className="dash-qs-val" style={{ color: '#ef4444' }}>{battleTokens}/5</div>
              <div className="dash-qs-label">Tokens</div>
            </div>
            <div className="dash-qs-div" />
            <div className="dash-qs">
              <div className="dash-qs-val">{coins.toLocaleString()}</div>
              <div className="dash-qs-label">Coins</div>
            </div>
            <div className="dash-qs-div" />
            <div className="dash-qs">
              <div className="dash-qs-val" style={{ color: '#facc15' }}>{medalScore}</div>
              <div className="dash-qs-label">Medal Pts</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div className="dash-tab-nav">
        <div className="container">
          <div className="dash-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`dash-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container dash-body">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="dash-grid">
            {/* Left: main content */}
            <div className="dash-main">

              {/* XP card */}
              <div className="dash-card dash-card-dark">
                <div className="dash-card-header">
                  <span className="dash-card-eyebrow">Ascension Status</span>
                  <span className="dash-level-chip">LVL {level}</span>
                </div>
                <div className="dash-xp-bar-wrap">
                  <div className="dash-xp-bar-fill" style={{ width: `${xpProgress}%` }} />
                </div>
                <div className="dash-xp-numbers">
                  <span>{xp.toLocaleString()} XP</span>
                  <span>{(Math.floor(xp / 550) + 1) * 550} needed</span>
                </div>
                <p className="dash-quote">"The strongest linear path is the one you constantly index."</p>
              </div>

              {/* Battle Ground Tournament Status Card */}
              <div className="dash-card" style={{ borderLeft: '4px solid #dc2626' }}>
                <div className="dash-card-header">
                  <div className="flex items-center gap-3">
                    <Flame size={20} fill="#dc2626" color="#dc2626" />
                    <span className="dash-card-title">Battle Ground Tournament Access</span>
                  </div>
                  <button className="neo-btn btn-sm" onClick={() => navigate('/pvp')}>Open Lobby</button>
                </div>
                <div style={{ padding: '8px 0' }}>
                  <BattleTokenCounter tokens={battleTokens} maxTokens={5} size="md" />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#71717a', marginTop: 8 }}>
                  Earn +1 Battle Token with every normal PvP duel victory. Gather 5 tokens to enter high-stakes tournament combat!
                </p>
              </div>

              {/* Current Quest */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="flex items-center gap-3">
                    <Star size={20} fill="#FFD600" color="#000" />
                    <span className="dash-card-title">Current Quest</span>
                  </div>
                  <button className="neo-btn btn-sm" onClick={() => navigate('/map')}>View Map</button>
                </div>
                <div className="dash-quest-card" onClick={() => navigate('/map/arrays')}>
                  <div className="dash-quest-tag">Chapter 1: The Flatlands</div>
                  <h3 className="dash-quest-title">Arrays & Linear Memory</h3>
                  <p className="dash-quest-desc">Master the fundamental way computers store and retrieve data in contiguous blocks.</p>
                  <button className="dash-quest-cta" onClick={() => navigate('/map/arrays')}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dash-quick-actions">
                {[
                  { label: 'Battle Ground', icon: Flame, path: '/pvp', color: '#dc2626', textColor: '#fff' },
                  { label: 'Enter Arena', icon: Swords, path: '/pvp', color: '#000', textColor: '#FFD600' },
                  { label: 'World Map', icon: Map, path: '/map', color: '#FFD600', textColor: '#000' },
                  { label: 'Visit Shop', icon: ShoppingCart, path: '/shop', color: '#fff', textColor: '#000' },
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(act.path)}
                    className="dash-action-btn"
                    style={{ background: act.color, color: act.textColor }}
                  >
                    <act.icon size={20} />
                    <span>{act.label}</span>
                    <ChevronRight size={16} className="ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: sidebar widgets */}
            <div className="dash-sidebar">
              {/* Trophy & Medals Case */}
              <div className="dash-card">
                <div className="dash-card-title-plain">TROPHY CASE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(234, 179, 8, 0.08)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🥇</span>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Gold Medals</span>
                    </div>
                    <span style={{ fontWeight: 900, fontSize: '1rem', color: '#facc15' }}>{goldMedals}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(203, 213, 225, 0.08)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(203, 213, 225, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🥈</span>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Silver Medals</span>
                    </div>
                    <span style={{ fontWeight: 900, fontSize: '1rem', color: '#e2e8f0' }}>{silverMedals}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(217, 119, 6, 0.08)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🥉</span>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Bronze Medals</span>
                    </div>
                    <span style={{ fontWeight: 900, fontSize: '1rem', color: '#fb923c' }}>{bronzeMedals}</span>
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="dash-card">
                <div className="dash-card-title-plain">VITALS</div>
                <div className="dash-vitals">
                  <div className="dash-vital-row">
                    <span className="dash-vital-label">HP (Logic Endurance)</span>
                    <span className="dash-vital-val">8500/9999</span>
                  </div>
                  <div className="dash-hp-grid">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`dash-hp-block ${i < 8 ? 'filled' : ''}`} />
                    ))}
                  </div>
                  <div className="dash-vital-row" style={{ marginTop: 12 }}>
                    <span className="dash-vital-label">MP (Syntax Mana)</span>
                    <span className="dash-vital-val">4200/5000</span>
                  </div>
                  <div className="dash-hp-grid">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`dash-hp-block mp ${i < 8 ? 'filled' : ''}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Equipped Relics */}
              <div className="dash-card">
                <div className="dash-card-title-plain">EQUIPPED RELICS</div>
                <div className="dash-relics-grid">
                  <div className="dash-relic">
                    <div className="dash-relic-rank ssr">SSR</div>
                    <Terminal size={28} />
                    <span>Mech Keyboard of Haste</span>
                  </div>
                  <div className="dash-relic">
                    <div className="dash-relic-rank sr">SR</div>
                    <Shield size={28} />
                    <span>Precision Mouse</span>
                  </div>
                  <div className="dash-relic empty">
                    <span className="dash-relic-plus">+</span>
                    <span>Equip</span>
                  </div>
                  <div className="dash-relic empty">
                    <span className="dash-relic-plus">+</span>
                    <span>Equip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT PROFILE TAB ── */}
        {activeTab === 'edit' && (
          <div className="dash-edit-layout">
            {/* Left: avatar + cosmetics */}
            <div className="dash-edit-left">
              <div className="dash-card">
                <div className="dash-card-title-plain">AVATAR</div>
                <div className="dash-avatar-preview">
                  <img
                    src={user?.imageUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayName}`}
                    alt="avatar"
                  />
                  <div className="dash-lvl-badge" style={{ position: 'relative', margin: '0 auto' }}>LVL {level}</div>
                </div>
                <button className="dash-change-avatar-btn">
                  <Camera size={16} /> Change Avatar
                </button>
              </div>

              <div className="dash-card">
                <div className="dash-card-title-plain">BANNER COLORS</div>
                <div className="dash-color-swatches">
                  {['#FFD600', '#000', '#fff', '#10B981', '#3B82F6', '#EF4444'].map(c => (
                    <button
                      key={c}
                      className="dash-swatch"
                      style={{ background: c, border: '3px solid #000' }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: identity form */}
            <div className="dash-edit-right">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title-plain">IDENTITY PROTOCOL</div>
                  {saved && (
                    <div className="dash-saved-badge">
                      <CheckCircle2 size={14} /> Saved!
                    </div>
                  )}
                </div>

                <div className="dash-form">
                  <div className="dash-field">
                    <label className="dash-label">Hunter Name (Handle)</label>
                    <input
                      type="text"
                      className="dash-input"
                      value={editName || displayName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </div>

                  <div className="dash-field">
                    <label className="dash-label">Guild Affiliation</label>
                    <input
                      type="text"
                      className="dash-input"
                      value={editGuild}
                      onChange={e => setEditGuild(e.target.value)}
                    />
                  </div>

                  <div className="dash-field">
                    <label className="dash-label">Battle Cry (Bio)</label>
                    <textarea
                      className="dash-input dash-textarea"
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                    />
                  </div>

                  <div className="dash-field">
                    <label className="dash-label">Title / Rank Tag</label>
                    <select className="dash-input">
                      <option>Ascendant IV</option>
                      <option>Gate Opener</option>
                      <option>Shadow Hunter</option>
                      <option>Monarch</option>
                      <option>Battle Ground Conqueror</option>
                    </select>
                  </div>

                  <div className="dash-form-actions">
                    <button className="dash-save-btn" onClick={handleSave}>
                      <Save size={16} /> Save Changes
                    </button>
                    <button className="dash-discard-btn">
                      Discard
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="dash-card dash-danger-card">
                <div className="dash-card-title-plain" style={{ color: '#EF4444' }}>DANGER ZONE</div>
                <p className="dash-danger-desc">These actions are permanent and cannot be undone.</p>
                <div className="dash-danger-actions">
                  <button className="dash-danger-btn">Reset Progress</button>
                  <button className="dash-danger-btn">Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROGRESS TAB ── */}
        {activeTab === 'progress' && (
          <div className="dash-progress-layout">
            <div className="dash-progress-header">
              <div className="dash-stat-card">
                <Zap size={28} />
                <div className="dash-stat-val">LVL {level}</div>
                <div className="dash-stat-label">Power Level</div>
              </div>
              <div className="dash-stat-card" style={{ background: '#dc2626', color: '#fff' }}>
                <Flame size={28} />
                <div className="dash-stat-val">{battleTokens}/5</div>
                <div className="dash-stat-label">Battle Tokens</div>
              </div>
              <div className="dash-stat-card" style={{ background: '#FFD600' }}>
                <Trophy size={28} />
                <div className="dash-stat-val">{medalScore} pts</div>
                <div className="dash-stat-label">Tournament Score</div>
              </div>
              <div className="dash-stat-card">
                <Target size={28} />
                <div className="dash-stat-val">{totalSolved}</div>
                <div className="dash-stat-label">Problems Solved</div>
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-card-title-plain">KNOWLEDGE MAP</div>
              <div className="dash-region-grid">
                {REGIONS.map(region => {
                  const prog = getRegionProgress(region.id);
                  const pct = prog.total > 0 ? Math.round((prog.solved / prog.total) * 100) : 0;
                  const isLocked = !progress.unlockedRegions?.[region.id];

                  return (
                    <div
                      key={region.id}
                      className={`dash-region-card ${isLocked ? 'locked' : ''}`}
                      onClick={() => !isLocked && navigate(`/map/${region.id}`)}
                    >
                      <div className="dash-region-icon">
                        <span>{region.icon}</span>
                      </div>
                      <div className="dash-region-body">
                        <div className="dash-region-name">{region.name}</div>
                        <div className="dash-region-pbar">
                          <div className="dash-region-pbar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="dash-region-pct">{pct}% — {prog.solved}/{prog.total} solved</div>
                      </div>
                      {isLocked ? <Lock size={16} className="dash-region-lock" /> : (
                        <ChevronRight size={16} className="dash-region-chevron" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
