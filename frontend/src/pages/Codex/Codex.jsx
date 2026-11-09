import { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { ENEMIES } from '../../data/enemies';
import { BookOpen, Skull, BarChart, Book, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Codex.css';

export default function Codex() {
  const { progress } = useProgress();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('enemies');
  
  // Track which enemies we've seen by evaluating solved regions/difficulties
  // For V3 mock, we'll mark the easy enemies of unlocked regions as 'seen'
  // and mark them 'defeated' if the region has any solves.
  
  const allEnemies = Object.values(ENEMIES);

  // A helper to guess if enemy was defeated (simplified for mock prototype)
  // E.g. slime is concepts Variables. If progress > 0 in basic region...
  // We'll just randomly mock some as defeated based on XP, or unlock based on region.
  const isDefeated = (tier) => {
    if (progress.level >= 10) return true;
    if (tier === 'green' || tier === 'yellow') return progress.xp > 0;
    if (tier === 'blue') return progress.unlockedRegions['strings'];
    if (tier === 'purple') return progress.unlockedRegions['linked-lists'];
    return false;
  };

  return (
    <div className="page codex-page">
      <div className="codex-header">
         <div className="codex-header-content">
            <h1>The Discovery Codex</h1>
            <p>Your archive of enemies slain and knowledge attained.</p>
         </div>
      </div>

      <div className="container">
        <div className="codex-tabs">
          <button className={`tab ${activeTab === 'enemies' ? 'active' : ''}`} onClick={() => setActiveTab('enemies')}>
            <Skull size={16} /> Enemy Log
          </button>
          <button className={`tab ${activeTab === 'lore' ? 'active' : ''}`} onClick={() => setActiveTab('lore')}>
            <Book size={16} /> Lore Archive
          </button>
          <button className={`tab ${activeTab === 'memories' ? 'active' : ''}`} onClick={() => setActiveTab('memories')}>
            <PlayCircle size={16} /> Memories
          </button>
          <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            <BarChart size={16} /> Statistics
          </button>
        </div>

        <div className="codex-content">
          {activeTab === 'enemies' && (
            <div className="enemy-grid">
              {allEnemies.map(enemy => {
                const defeated = isDefeated(enemy.tier);
                return (
                  <div key={enemy.id} className={`enemy-card ${defeated ? 'defeated' : 'locked'}`} style={{ '--enemy-color': enemy.color }}>
                    <div className="enemy-sprite">
                      {defeated ? '👾' : '❓'}
                    </div>
                    <div className="enemy-details">
                      <div className="enemy-name">{defeated ? enemy.name : 'Unknown Entity'}</div>
                      <div className="enemy-concept" style={{ color: enemy.color }}>{enemy.concept}</div>
                      {defeated && <div className="enemy-lore">"{enemy.lore}"</div>}
                      {defeated && (
                        <div className="enemy-stats">
                          <span>HP {enemy.baseHp}</span>
                          <span>ATK {enemy.baseAttack}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'lore' && (
            <div className="lore-archive">
              <div className="lore-entry unlocked">
                 <h3>Fragment #001: The Descent</h3>
                 <p>"The Abyss consists of an endless hierarchy of logic and problems. Those who conquer its depths command the laws of computation."</p>
              </div>
              {progress.level >= 5 ? (
                <div className="lore-entry unlocked">
                   <h3>Fragment #002: The Arrays</h3>
                   <p>"The Goblin hoarders structured their realm in contiguous blocks. To defeat them requires sequential understanding..."</p>
                </div>
              ) : (
                <div className="lore-entry locked">
                   <h3>Fragment #002: ???</h3>
                   <p>Reach Level 5 to unlock this lore fragment.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'memories' && (
            <div className="memories-archive">
              <div className="memory-card animate-scaleIn">
                <div className="memory-visual bootcamp-thumb"></div>
                <div className="memory-info">
                  <h3>Chapter 0: The Null Exception</h3>
                  <p>Witness the fragmentation of reality and your first awakening.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/story/boot-sequence')}>
                    <PlayCircle size={14} /> REWATCH SEQUENCE
                  </button>
                </div>
              </div>
              <div className="memory-card locked">
                <div className="memory-info">
                  <h3>Chapter 1: The Sorting Walls</h3>
                  <p>Infiltrating the first block. (Complete Array Region to Unlock)</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-dashboard">
              <div className="stat-card">
                 <div className="stat-label">Coder Level</div>
                 <div className="stat-value">{progress.level}</div>
              </div>
              <div className="stat-card">
                 <div className="stat-label">Total XP</div>
                 <div className="stat-value">{progress.xp}</div>
              </div>
              <div className="stat-card">
                 <div className="stat-label">Coins Hoarded</div>
                 <div className="stat-value" style={{ color: '#FACC15' }}>{progress.coins}</div>
              </div>
              <div className="stat-card">
                 <div className="stat-label">Problems Solved</div>
                 <div className="stat-value">{Object.keys(progress.solvedProblems).length}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
