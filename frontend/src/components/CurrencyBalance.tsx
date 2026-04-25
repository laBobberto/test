import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from './animations/AnimatedNumber';

interface CurrencyBalanceProps {
  balance: number;
  onClick?: () => void;
}

export const CurrencyBalance: React.FC<CurrencyBalanceProps> = ({ balance, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:scale-110 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl">💰</span>
        <span className="font-semibold">
          <AnimatedNumber value={balance} />
        </span>
      </motion.button>

      {showTooltip && (
        <motion.div
          className="absolute top-full mt-2 right-0 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-3 whitespace-nowrap z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Виртуальная валюта
          </p>
          <p className="font-semibold gradient-text">
            <AnimatedNumber value={balance} /> монет
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
