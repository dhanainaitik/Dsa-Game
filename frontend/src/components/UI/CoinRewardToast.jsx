import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../../context/ProgressContext';
import { Trophy, X } from 'lucide-react';
import './CoinRewardToast.css';

export default function CoinRewardToast() {
  const { rewardToast, clearRewardToast } = useProgress();

  useEffect(() => {
    if (!rewardToast) return;
    const timer = setTimeout(() => {
      clearRewardToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [rewardToast, clearRewardToast]);

  return (
    <AnimatePresence>
      {rewardToast && (
        <motion.div
          className="coin-reward-toast-wrapper"
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.92 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="coin-reward-toast neo-border">
            <div className="reward-toast-left">
              <div className="coin-spin-icon">
                <span className="coin-emoji">🪙</span>
              </div>
            </div>

            <div className="reward-toast-body">
              <div className="reward-toast-top">
                <span className="reward-coins-badge">+{rewardToast.coins || 20} COINS!</span>
                <span className="reward-section-tag">{rewardToast.section || 'CHALLENGE'}</span>
              </div>
              <h4 className="reward-toast-heading">PROBLEM SOLVED!</h4>
              <p className="reward-toast-sub">Great work! Keep climbing!</p>
              {rewardToast.title && (
                <div className="reward-problem-title">
                  <Trophy size={11} className="inline mr-1" />
                  {rewardToast.title}
                </div>
              )}
            </div>

            <button
              className="reward-toast-close"
              onClick={clearRewardToast}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

