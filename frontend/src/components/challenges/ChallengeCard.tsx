import React from 'react';
import { motion } from 'framer-motion';
import type { Challenge } from '../../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept?: (id: number) => void;
  onComplete?: (id: number) => void;
}

const difficultyColors: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
};

const difficultyStars: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onAccept,
  onComplete,
}) => {
  const progress = ((challenge.progress || 0) / challenge.target_count) * 100;
  const isCompleted = challenge.status === 'completed';
  const isActive = challenge.status === 'active';
  const isAvailable = challenge.status === 'available';

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {challenge.title}
            </h3>
            {isCompleted && <span className="text-green-400">✓</span>}
            {isActive && <span className="text-yellow-400">⏱</span>}
          </div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
            {challenge.description}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold gradient-text">{challenge.reward_points}</div>
          <div style={{ color: 'var(--text-secondary)' }} className="text-xs">баллов</div>
        </div>
      </div>

      {/* Progress Bar */}
      {(isActive || isCompleted) && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">
              Прогресс: {challenge.progress || 0}/{challenge.target_count}
            </span>
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Timer for time-limited challenges */}
      {challenge.end_date && (
        <div style={{ color: 'var(--text-secondary)' }} className="text-xs mb-4">
          {isCompleted ? 'Завершено: ' : 'До: '}
          {new Date(challenge.end_date).toLocaleDateString('ru-RU')}
        </div>
      )}

      {/* Action Button */}
      {!isCompleted && (
        <motion.button
          onClick={() => {
            if (isActive && onComplete) {
              onComplete(challenge.id);
            } else if (isAvailable && onAccept) {
              onAccept(challenge.id);
            }
          }}
          className={`w-full py-2 rounded-lg font-semibold transition-all ${
            isActive
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isActive ? 'Отметить прогресс' : 'Принять челленж'}
        </motion.button>
      )}

      {isCompleted && (
        <div className="w-full py-2 rounded-lg font-semibold bg-gray-600 text-white text-center">
          ✓ Завершено
        </div>
      )}
    </motion.div>
  );
};
