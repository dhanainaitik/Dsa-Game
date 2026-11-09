import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Map, FlaskConical, ArrowRight, Swords, Sparkles, Zap, Code, Eye, Target, FlaskRound, Touchpad, Trophy, Users } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import './Home.css';

const FLOW_STEPS = [
  { id: 'see', icon: Eye, label: 'See', desc: 'Observe visual patterns & animations' },
  { id: 'touch', icon: Touchpad, label: 'Touch', desc: 'Interact directly with data structures' },
  { id: 'exp', icon: FlaskRound, label: 'Experiment', desc: 'Break rules safely, see what happens' },
  { id: 'und', icon: Target, label: 'Understand', desc: 'Logic clicks into place naturally' },
  { id: 'code', icon: Code, label: 'Code', desc: 'Syntax is the final, easy step' },
];

const STATS = [
  { value: '180+', label: 'Problems' },
  { value: '6', label: 'Regions' },
  { value: '3', label: 'Game Modes' },
  { value: '∞', label: 'Grind' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { progress } = useProgress();
  const totalSolved = Object.keys(progress.solvedProblems).length;

  return (
    <div className="home-root animate-fadeIn">

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="hero-pattern" />
        <div className="container hero-content">

          {/* Left: Text */}
          <div className="hero-text-block">
            <div className="hero-badge">
              <Sparkles size={13} />
              <span>THE NEXT EVOLUTION OF DSA LEARNING</span>
            </div>

            <h1 className="hero-title">
              MASTER<br />
              THE <span className="text-stroke">ALGO</span><br />
              BY PLAYING IT.
            </h1>

            <p className="hero-subtitle">
              The only platform where Data Structures come alive. Build gut-level intuition through interaction — then solidify it with code.
            </p>

            <div className="hero-actions">
              <button
                className="hero-btn-primary"
                onClick={() => navigate(isSignedIn ? '/dashboard' : '/login')}
              >
                {isSignedIn ? 'RESUME ASCENSION' : 'START JOURNEY'}
                <ArrowRight size={20} />
              </button>
              <button className="hero-btn-secondary" onClick={() => navigate('/logic-lab')}>
                VISIT THE LAB
              </button>
            </div>

            {/* Mini stats */}
            <div className="hero-stats">
              {STATS.map(s => (
                <div key={s.label} className="hero-stat">
                  <div className="hero-stat-val">{s.value}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual card */}
          <div className="hero-visual-block">
            <div className="visual-card">
              <div className="visual-card-header">
                <div className="dot red" /><div className="dot yellow" /><div className="dot green" />
                <span className="visual-card-title">LogicVisualizer.v2</span>
                <span className="visual-live-badge">● LIVE</span>
              </div>
              <div className="visual-card-body">
                {/* Binary tree visualizer */}
                <div className="tree-root">
                  <div className="tree-node root-node">7</div>
                  <div className="tree-branches">
                    <div className="tree-branch left-branch">
                      <div className="branch-line" />
                      <div className="tree-node child-node">3</div>
                      <div className="tree-branches">
                        <div className="tree-branch">
                          <div className="branch-line" />
                          <div className="tree-node leaf-node active">1</div>
                        </div>
                        <div className="tree-branch">
                          <div className="branch-line" />
                          <div className="tree-node leaf-node">5</div>
                        </div>
                      </div>
                    </div>
                    <div className="tree-branch right-branch">
                      <div className="branch-line" />
                      <div className="tree-node child-node">9</div>
                      <div className="tree-branches">
                        <div className="tree-branch">
                          <div className="branch-line" />
                          <div className="tree-node leaf-node">8</div>
                        </div>
                        <div className="tree-branch">
                          <div className="branch-line" />
                          <div className="tree-node leaf-node">12</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="visual-cursor-anim" />
              </div>
              <div className="visual-card-footer">
                <code className="visual-code">Traversal: <span className="code-accent">IN-ORDER</span></code>
                <span className="visual-step">Step 3 / 7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY ── */}
      <section className="home-flow">
        <div className="container">
          <div className="section-label-row">
            <span className="section-eyebrow">HOW IT WORKS</span>
            <h2 className="section-title">The Methodology</h2>
            <p className="section-desc">Understanding before syntax. Retention through interaction.</p>
          </div>
          <div className="flow-grid">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.id} className="flow-card">
                <div className="flow-step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="flow-icon-box">
                  <step.icon size={28} />
                </div>
                <h3 className="flow-card-title">{step.label}</h3>
                <p className="flow-card-desc">{step.desc}</p>
                {i < FLOW_STEPS.length - 1 && <div className="flow-connector">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section className="home-bento">
        <div className="container">
          <div className="section-label-row">
            <span className="section-eyebrow">PLATFORM FEATURES</span>
            <h2 className="section-title">Everything in One Arena</h2>
          </div>
          <div className="bento-grid">

            {/* Tile 1: Map — wide */}
            <div className="bento-tile b-map" onClick={() => navigate('/map')}>
              <div className="bento-tile-content">
                <span className="bento-eyebrow">Exploration</span>
                <h3 className="bento-title">IMMERSIVE MAP</h3>
                <p className="bento-desc">Travel through Array Archipelagos and Binary Forests. Unlock regions as you level up.</p>
                <button className="bento-link">Explore Map →</button>
              </div>
              <Map size={160} className="bento-icon-bg" strokeWidth={0.8} />
            </div>

            {/* Tile 2: PvP — dark accent */}
            <div className="bento-tile b-pvp" onClick={() => navigate('/pvp')}>
              <div className="bento-tile-content">
                <span className="bento-eyebrow" style={{ color: '#FAFF00' }}>Multiplayer</span>
                <h3 className="bento-title" style={{ color: '#FAFF00' }}>PVP ARENA</h3>
                <p className="bento-desc" style={{ color: '#aaa' }}>Duel solo 1v1, team up in Duo, or go full 2v2. Real-time logic combat.</p>
                <div className="pvp-mode-tags">
                  <span>1v1</span><span>DUO</span><span>2v2</span>
                </div>
              </div>
              <Swords size={100} className="bento-icon-bg pvp-icon" strokeWidth={0.8} />
            </div>

            {/* Tile 3: Stats */}
            <div className="bento-tile b-stat">
              <div className="bento-stat-num">{totalSolved + 422}</div>
              <div className="bento-stat-label">ASCENDANTS<br />ACTIVE</div>
              <Users size={40} className="bento-stat-icon" />
            </div>

            {/* Tile 4: Logic Lab */}
            <div className="bento-tile b-lab" onClick={() => navigate('/logic-lab')}>
              <div className="bento-tile-content">
                <span className="bento-eyebrow">Visual Learning</span>
                <h3 className="bento-title">LOGIC LAB</h3>
                <p className="bento-desc">Physics-based visualizers for Arrays, Trees, and Graphs. Learn by touching, not reading.</p>
                <button className="bento-link">Enter Lab →</button>
              </div>
              <FlaskConical size={120} className="bento-icon-bg" strokeWidth={0.8} />
            </div>

            {/* Tile 5: Leaderboard */}
            <div className="bento-tile b-lb" onClick={() => navigate('/dashboard')}>
              <Trophy size={40} className="mb-4" />
              <h3 className="bento-title">RANKED</h3>
              <p className="bento-desc" style={{ color: '#555' }}>Climb the leaderboard. Earn coins. Unlock gear.</p>
            </div>

            {/* Tile 6: AI */}
            <div className="bento-tile b-ai">
              <span className="bento-eyebrow">Intelligence</span>
              <h3 className="bento-title">AI COMPANION</h3>
              <p className="bento-desc">Your AI guide gives hints, analyses your complexity, and helps you level up — without spoiling the fight.</p>
              <div className="ai-dots">
                <span /><span /><span />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta">
        <div className="container cta-content">
          <h2 className="cta-title">
            STOP<br />
            SURFING.<br />
            <span className="cta-accent">START<br />SOLVING.</span>
          </h2>
          <div className="cta-right">
            <p className="cta-sub">Join thousands of hunters ascending the algorithm.</p>
            <button
              className="hero-btn-primary cta-btn"
              onClick={() => navigate(isSignedIn ? '/dashboard' : '/login')}
            >
              {isSignedIn ? 'GO TO DASHBOARD' : 'JOIN THE EXPEDITION'}
              <ArrowRight size={20} />
            </button>
            <div className="cta-tags">
              <span>Free to start</span>
              <span>No setup</span>
              <span>6 Regions</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
