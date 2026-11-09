import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import './RegionPortal.css';

export default function RegionPortal({ region, locked, progress, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);

  const pct = progress.total > 0 ? (progress.solved / progress.total) * 100 : 0;
  const circumference = 2 * Math.PI * 52; // r=52 for slightly larger ring
  const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;

  const handleClick = (e) => {
    if (locked) return;
    
    // Create ripple effect
    const newRipple = { id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);

    onClick && onClick();
  };

  return (
    <motion.div
      className={`region-portal ${locked ? 'locked' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: isHovered ? -5 : [0, -4, 0] 
      }}
      transition={{
        y: isHovered ? { duration: 0.2 } : { duration: 4, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 0.5 },
        scale: { duration: 0.3 }
      }}
    >
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="portal-ripple"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Energy Pulse Ring */}
      {!locked && (
        <motion.div 
          className="portal-energy-ring"
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Structural Rings */}
      <div className="portal-rings">
        <div className="ring-outer" style={{ borderColor: !locked ? region.color : '#000' }} />
        <div className="ring-inner" />
      </div>

      {/* Glass Core Surface */}
      <div className="portal-core">
        <motion.div 
          className="portal-icon"
          animate={isHovered ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
          style={{ 
            color: !locked ? region.color : '#a3a3a3',
            '--region-glow': region.glowColor 
          }}
        >
          {region.icon}
        </motion.div>
      </div>

      {/* Progress Ring */}
      {!locked && pct > 0 && (
        <svg viewBox="0 0 120 120" className="portal-progress">
          <circle 
            cx="60" cy="60" r="52" 
            stroke={region.color}
            strokeDasharray={strokeDasharray}
            opacity={isHovered ? 1 : 0.6}
          />
        </svg>
      )}

      {locked && (
        <div className="portal-lock">
          <Lock size={16} />
        </div>
      )}
    </motion.div>
  );
}
