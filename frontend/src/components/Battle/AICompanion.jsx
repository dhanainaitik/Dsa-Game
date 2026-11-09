import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import './AICompanion.css';

const AICompanion = ({ feedback, isVisible, nextStep }) => {
  return (
    <AnimatePresence>
      {isVisible && feedback && (
        <motion.div
          className="ai-companion-wrapper"
          initial={{ opacity: 0, y: 50, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
          <div className="ai-companion-bubble">
            <div className="ai-companion-header">
              <Sparkles size={14} className="sparkle-icon" />
              <span>Codo Guide</span>
            </div>
            
            <p className="ai-companion-text">{feedback}</p>
            
            {nextStep && (
              <div className="ai-companion-next">
                <ArrowRight size={12} />
                <span>{nextStep}</span>
              </div>
            )}

            <div className="bubble-tail"></div>
          </div>

          <div className="ai-companion-avatar">
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
