import { motion, AnimatePresence } from 'framer-motion';
import './TeamCombo.css';

/**
 * TeamCombo — Full-screen overlay animation when a Team Combo is triggered.
 * Shown briefly then auto-dismissed.
 */
export default function TeamCombo({ comboEvent, myTeam }) {
  if (!comboEvent) return null;

  const isMyTeam = comboEvent.team === myTeam;
  const label = isMyTeam ? 'TEAM COMBO!' : 'ENEMY COMBO!';
  const subLabel = isMyTeam
    ? `+${comboEvent.bonusDamage} BONUS DAMAGE DEALT!`
    : `ENEMY DEALT +${comboEvent.bonusDamage} EXTRA DAMAGE!`;

  return (
    <AnimatePresence>
      <motion.div
        className={`combo-overlay ${isMyTeam ? 'combo-win' : 'combo-lose'}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <motion.div
          className="combo-bg-burst"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 3, rotate: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="combo-content">
          <motion.div
            className="combo-label"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          >
            {label}
          </motion.div>
          <motion.div
            className="combo-sub"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {subLabel}
          </motion.div>
          {isMyTeam && (
            <motion.div
              className="combo-stars"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ★ ★ ★
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
