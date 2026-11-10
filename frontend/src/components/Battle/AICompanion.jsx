import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import './AICompanion.css';

const AICompanion = ({ feedback, isVisible, nextStep, severity = 'info', onDismiss }) => {
  return (
    <AnimatePresence>
      {isVisible && feedback && (
        <motion.div
          key={feedback}
          className={`ai-companion-wrapper severity-${severity}`}
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9, transition: { duration: 0.18 } }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        >
          <div className="ai-companion-bubble">
            <div className="ai-companion-header">
              <div className="ai-companion-title">
                <Sparkles size={13} className="sparkle-icon" />
                <span>CODO GUIDE</span>
              </div>
              {onDismiss && (
                <button
                  type="button"
                  className="ai-companion-close"
                  onClick={onDismiss}
                  aria-label="Close Codo Guide"
                  title="Dismiss"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <p className="ai-companion-text">{feedback}</p>

            {nextStep && (
              <div className="ai-companion-next">
                <ArrowRight size={12} style={{ flexShrink: 0 }} />
                <span>{nextStep}</span>
              </div>
            )}

            <div className="bubble-tail" />
          </div>

          <div
            className="ai-companion-avatar"
            onClick={onDismiss}
            role={onDismiss ? 'button' : undefined}
            title={onDismiss ? 'Click to hide Codo Guide' : 'Codo Guide'}
          >
            <div className="avatar-circle">
              <span className="avatar-emoji">👩‍💻</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AICompanion;
