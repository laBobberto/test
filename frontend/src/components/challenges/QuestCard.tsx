import React from 'react';
import { motion } from 'framer-motion';
import type { Quest } from '../../types';

interface QuestCardProps {
  quest: Quest;
  onStart?: (id: number) => void;
  onContinue?: (id: number) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onStart, onContinue }) => {
  const isActive = quest.status === 'active';
  const isCompleted = quest.status === 'completed';
  const isLocked = quest.status === 'locked';

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {quest.title}
          </h3>
          {isCompleted && <span className="text-green-400">✓</span>}
          {isLocked && <span className="text-gray-400">🔒</span>}
        </div>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3">
          {quest.description}
        </p>
      </div>

      {/* Steps */}
      <div className="mb-4 space-y-2">
        {quest.steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              step.completed
                ? 'bg-green-500 border-green-500'
                : 'border-[var(--border-primary)]'
            }`}>
              {step.completed && <span className="text-white text-xs">✓</span>}
            </div>
            <div className="flex-1">
              <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">
                {step.title}
              </p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Прогресс
          </span>
          <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold">
            {quest.completion_percentage}%
          </span>
        </div>
        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
            initial={{ width: 0 }}
            animate={{ width: `${quest.completion_percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
        <div>
          <div style={{ color: 'var(--text-secondary)' }} className="text-xs">Награда</div>
          <div className="font-semibold gradient-text">{quest.reward_points} баллов</div>
        </div>
        {quest.reward_currency > 0 && (
          <div>
            <div style={{ color: 'var(--text-secondary)' }} className="text-xs">Валюта</div>
            <div className="font-semibold gradient-text">{quest.reward_currency} 💰</div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <motion.button
        onClick={() => {
          if (isActive && onContinue) {
            onContinue(quest.id);
          } else if (!isActive && onStart) {
            onStart(quest.id);
          }
        }}
        disabled={isLocked || isCompleted}
        className={`w-full py-2 rounded-lg font-semibold transition-all ${
          isCompleted
            ? 'bg-gray-500 text-white cursor-not-allowed'
            : isLocked
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
        }`}
        whileHover={!isLocked && !isCompleted ? { scale: 1.05 } : {}}
        whileTap={!isLocked && !isCompleted ? { scale: 0.95 } : {}}
      >
        {isCompleted ? '✓ Завершено' : isActive ? 'Продолжить' : isLocked ? '🔒 Заблокировано' : 'Начать'}
      </motion.button>
    </motion.div>
  );
};
