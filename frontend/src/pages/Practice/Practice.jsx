import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, CheckCircle2, Lock, Circle } from 'lucide-react';
import { REGIONS } from '../../data/regions';
import { getStatesForRegion, getProblem } from '../../data/problems';
import { useProgress } from '../../context/ProgressContext';
import './Practice.css';

const DIFF_LABELS = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard'];

export default function Practice() {
  const navigate = useNavigate();
  const { progress, isStateLocked, isRegionLocked, getStateProgress, getRegionProgress } = useProgress();
  const [expandedTopic, setExpandedTopic] = useState('arrays');
  const [expandedState, setExpandedState] = useState(null);

  return (
    <div className="page practice-page">
      <div className="container page-content animate-fadeIn">
        <div className="practice-header">
          <span className="section-label">Practice System</span>
          <h1 style={{ marginTop: 6 }}>Topic Practice</h1>
          <p style={{ marginTop: 8 }}>
            Browse all topics and track your progress state by state.
          </p>
        </div>

        <div className="practice-layout">
          {/* Sidebar — topic list */}
          <div className="practice-sidebar">
            {REGIONS.map(region => {
              const regionProg = getRegionProgress(region.id);
              const pct = regionProg.total > 0 ? Math.round((regionProg.solved / regionProg.total) * 100) : 0;
              const locked = isRegionLocked(region.id);
              const active = expandedTopic === region.id;

              return (
                <button
                  key={region.id}
                  className={`sidebar-topic ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
                  onClick={() => !locked && setExpandedTopic(active ? null : region.id)}
                  style={{ '--color': region.color }}
                >
                  <div className="sidebar-topic-icon" style={{ color: locked ? undefined : region.color }}>
                    {region.icon}
                  </div>
                  <div className="sidebar-topic-info">
                    <span className="sidebar-topic-name">{region.name}</span>
                    <div className="sidebar-topic-bar">
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pct}%`, background: locked ? undefined : region.color }}
                        />
                      </div>
                      <span className="sidebar-topic-pct">{pct}%</span>
                    </div>
                  </div>
                  {locked ? (
                    <Lock size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  ) : active ? (
                    <ChevronDown size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronRight size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main content */}
          <div className="practice-main">
            {expandedTopic ? (
              <TopicDetail
                regionId={expandedTopic}
                expandedState={expandedState}
                setExpandedState={setExpandedState}
                navigate={navigate}
                progress={progress}
                isStateLocked={isStateLocked}
                getStateProgress={getStateProgress}
              />
            ) : (
              <div className="empty-state">
                <span>Select a topic from the sidebar.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicDetail({ regionId, expandedState, setExpandedState, navigate, progress, isStateLocked, getStateProgress }) {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return null;

  const states = getStatesForRegion(regionId);

  return (
    <div className="topic-detail animate-fadeIn">
      <div className="topic-detail-header">
        <div
          className="topic-detail-icon"
          style={{
            background: `color-mix(in srgb, ${region.color} 10%, var(--bg-elevated))`,
            borderColor: `color-mix(in srgb, ${region.color} 30%, var(--border))`,
            color: region.color,
          }}
        >
          {region.icon}
        </div>
        <div>
          <h2>{region.name}</h2>
          <p style={{ marginTop: 4, fontSize: '0.875rem' }}>{region.description}</p>
        </div>
      </div>

      <div className="states-accordion">
        {states.map((state) => {
          const locked = isStateLocked(state.id);
          const prog = getStateProgress(state.id);
          const pct = prog.total > 0 ? Math.round((prog.solved / prog.total) * 100) : 0;
          const complete = prog.solved === prog.total && prog.total > 0;
          const open = expandedState === state.id;
          const problems = state.problems.map(pid => getProblem(pid)).filter(Boolean);

          return (
            <div key={state.id} className={`state-accordion ${locked ? 'locked' : ''}`}>
              <div
                className="state-accordion-header"
                onClick={() => !locked && setExpandedState(open ? null : state.id)}
              >
                <div className="state-acc-left">
                  {complete
                    ? <CheckCircle2 size={16} color="var(--success)" />
                    : locked
                    ? <Lock size={14} color="var(--text-muted)" />
                    : <Circle size={14} color="var(--text-muted)" />
                  }
                  <span className="state-acc-name">{state.name}</span>
                  <span className="state-acc-label">— {state.label}</span>
                </div>
                <div className="state-acc-right">
                  <div className="progress-bar" style={{ width: 100 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: complete ? undefined : region.color,
                      }}
                    />
                  </div>
                  <span className="state-acc-count">{prog.solved}/{prog.total}</span>
                  {!locked && (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />)}
                </div>
              </div>

              {open && !locked && (
                <div className="state-accordion-body animate-fadeIn">
                  {problems.map((problem, idx) => {
                    const solved = !!progress.solvedProblems[problem.id];
                    const diff = DIFF_LABELS[idx];
                    const diffClass = diff.toLowerCase().replace(/[^a-z]/g, '');

                    return (
                      <div
                        key={problem.id}
                        className={`practice-problem-row ${solved ? 'solved' : ''}`}
                        onClick={() => navigate(`/problem/${problem.id}`)}
                      >
                        <div className="ppr-status">
                          {solved
                            ? <CheckCircle2 size={14} color="var(--success)" />
                            : <Circle size={14} color="var(--text-muted)" />
                          }
                        </div>
                        <span className="ppr-num">{idx + 1}.</span>
                        <span className="ppr-title">{problem.title}</span>
                        <span className={`badge badge-${diffClass} ppr-diff`}>{diff}</span>
                        <ChevronRight size={13} color="var(--text-muted)" />
                      </div>
                    );
                  })}

                  <button
                    className="btn btn-outline btn-sm state-enter-btn"
                    onClick={() => navigate(`/map/${regionId}/${state.id}`)}
                  >
                    Open State View <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
