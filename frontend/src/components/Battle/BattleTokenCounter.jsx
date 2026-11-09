import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Lock, Unlock } from 'lucide-react';
import './BattleTokenCounter.css';

export default function BattleTokenCounter({ tokens = 0, maxTokens = 5, size = 'md', showLabel = true }) {
  const current = Math.min(tokens, maxTokens);
  const isFullyCharged = tokens >= maxTokens;
  const remaining = maxTokens - current;

  return (
    <div className={`btc-container size-${size} ${isFullyCharged ? 'fully-charged' : ''}`}>
      {showLabel && (
        <div className="btc-header">
          <div className="btc-title">
            <Zap size={size === 'sm' ? 12 : 14} className="btc-icon" fill="currentColor" />
            <span>BATTLE TOKENS</span>
          </div>
          <div className="btc-count">
            <span className="btc-current">{tokens}</span>
            <span className="btc-max">/{maxTokens}</span>
          </div>
        </div>
      )}

      {/* 5 Token Pips */}
      <div className="btc-pips-row">
        {[...Array(maxTokens)].map((_, i) => {
          const filled = i < current;
          return (
            <motion.div
              key={i}
              className={`btc-pip ${filled ? 'filled' : 'empty'}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
            >
              {filled && (
                <motion.div
                  className="btc-pip-inner"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {isFullyCharged ? (
        <div className="btc-status btc-status-unlocked">
          <Unlock size={11} />
          <span>BATTLE GROUND UNLOCKED</span>
        </div>
      ) : (
        <div className="btc-status btc-status-locked">
          <Lock size={11} />
          <span>{remaining} MORE WIN{remaining !== 1 ? 'S' : ''} TO UNLOCK BATTLE GROUND</span>
        </div>
      )}
    </div>
  );
}
