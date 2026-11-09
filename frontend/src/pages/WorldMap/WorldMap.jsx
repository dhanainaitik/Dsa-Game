import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { REGIONS } from '../../data/regions';
import { useProgress } from '../../context/ProgressContext';
import RegionPortal from '../../components/WorldMap/RegionPortal';
import PageHeader from '../../components/UI/PageHeader';
import './WorldMap.css';

export default function WorldMap() {
  const navigate = useNavigate();
  const { isRegionLocked, getRegionProgress } = useProgress();
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState(null);

  const handleRegionClick = (region) => {
    if (isRegionLocked(region.id)) return;
    setActive(region.id);
    setTimeout(() => navigate(`/map/${region.id}`), 250);
  };

  const hoveredRegion = REGIONS.find(r => r.id === hovered);

  return (
    <div className="worldmap animate-fadeIn">
      {/* Background grid */}
      <div className="worldmap-grid" />

      <PageHeader 
        title="THE SEQUENTIAL GATES" 
        description="Select a region to begin practice. Complete all states to unlock the next region."
      />

      {/* Map canvas */}
      <div className="worldmap-canvas">
        {/* Terrain decorations */}
        <div className="terrain-lines" />

        {REGIONS.map((region) => {
          const locked = isRegionLocked(region.id);
          const prog = getRegionProgress(region.id);
          const isHovered = hovered === region.id;
          const isActive = active === region.id;

          return (
            <div
              key={region.id}
              className={`map-region ${locked ? 'locked' : 'unlocked'} ${isHovered ? 'is-hovered' : ''} ${isActive ? 'is-active' : ''}`}
              style={{
                left: `${region.position.x}%`,
                top: `${region.position.y}%`,
              }}
              onMouseEnter={() => setHovered(region.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <RegionPortal
                region={region}
                locked={locked}
                progress={prog}
                onClick={() => handleRegionClick(region)}
              />

              {/* Label */}
              <div className="region-label">
                <span className="region-name">{region.name}</span>
                {!locked && prog.solved > 0 && (
                  <span className="region-progress-text">{prog.solved}/{prog.total}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Connection lines between some regions (decorative) */}
        <svg className="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="18" y1="28" x2="42" y2="18" className="conn-line" />
          <line x1="42" y1="18" x2="68" y2="22" className="conn-line" />
          <line x1="18" y1="28" x2="25" y2="55" className="conn-line" />
          <line x1="25" y1="55" x2="35" y2="75" className="conn-line" />
          <line x1="55" y1="48" x2="62" y2="75" className="conn-line" />
          <line x1="55" y1="48" x2="78" y2="55" className="conn-line" />
        </svg>
      </div>

      {/* Hover tooltip */}
      {hoveredRegion && (
        <div
          className="region-tooltip animate-scaleIn"
          style={{
            left: `calc(${hoveredRegion.position.x}% + 60px)`,
            top: `${hoveredRegion.position.y}%`,
          }}
        >
          <div className="tooltip-header">
            <span
              className="tooltip-icon"
              style={{ color: hoveredRegion.color }}
            >
              {hoveredRegion.icon}
            </span>
            <div>
              <div className="tooltip-name">{hoveredRegion.name}</div>
              <div className="tooltip-subtitle">{hoveredRegion.subtitle}</div>
            </div>
          </div>
          <p className="tooltip-desc">{hoveredRegion.description}</p>
          <div className="tooltip-meta">{hoveredRegion.complexity}</div>
          {isRegionLocked(hoveredRegion.id) ? (
            <div className="tooltip-locked">Complete previous regions to unlock</div>
          ) : (
            <div className="tooltip-cta">
              Click to enter <ChevronRight size={13} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
