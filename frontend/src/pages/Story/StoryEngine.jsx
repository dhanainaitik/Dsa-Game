import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storyChapters } from '../../data/story';
import { useAuth } from '../../context/AuthContext';
import { SkipForward } from 'lucide-react';
import './StoryEngine.css';

export default function StoryEngine() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { completeIntro } = useAuth();
  
  const chapter = storyChapters[chapterId];
  const [currentPanel, setCurrentPanel] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // If invalid chapter, boot to home
    if (!chapter) {
      navigate('/', { replace: true });
    }
  }, [chapter, navigate]);

  if (!chapter) return null;

  const handleAdvance = () => {
    if (closing) return;
    
    if (currentPanel < chapter.panels.length - 1) {
      setCurrentPanel(prev => prev + 1);
    } else {
      handleExit();
    }
  };

  const handleExit = () => {
    setClosing(true);
    completeIntro();
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 800); // Wait for exit animation
  };

  return (
    <div className={`story-engine ${closing ? 'story-exit' : ''}`} onClick={handleAdvance}>
      <button className="skip-btn" onClick={(e) => { e.stopPropagation(); handleExit(); }}>
        SKIP <SkipForward size={16} />
      </button>

      <div className="story-canvas">
        {chapter.panels.slice(0, currentPanel + 1).map((panel, idx) => (
          <div 
            key={panel.id} 
            className={`story-panel panel-${panel.visual} animate-slideUp`}
            style={{ 
              zIndex: idx,
              animationDelay: '0.1s' 
            }}
          >
            {/* The CSS Art Visual representation lives in the background of panel-visual class */}
            {panel.glitch && <div className="panel-glitch-overlay"></div>}
            
            <div className={`system-text-box ${panel.alert ? 'alert' : ''} ${panel.success ? 'success' : ''}`}>
               {panel.systemText}
            </div>
          </div>
        ))}
      </div>
      
      <div className="story-hint">
        CLICK ANYWHERE TO CONTINUE
      </div>
    </div>
  );
}
