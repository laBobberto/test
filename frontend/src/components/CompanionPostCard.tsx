import React from 'react';
import { motion } from 'framer-motion';
import type { EventCompanion } from '../types';

interface CompanionPostCardProps {
  post: EventCompanion;
  onJoin?: (id: number) => void;
  onManage?: (id: number) => void;
  isOwn?: boolean;
  isLoading?: boolean;
}

export const CompanionPostCard: React.FC<CompanionPostCardProps> = ({
  post,
  onJoin,
  onManage,
  isOwn,
  isLoading,
}) => {
  const spotsLeft = post.max_companions - post.current_companions;
  const isFull = spotsLeft <= 0;

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
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {post.title || post.username}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3">
            {post.description || post.message}
          </p>
          {post.location && (
            <p style={{ color: 'var(--text-tertiary)' }} className="text-xs mb-2">
              📍 {post.location}
            </p>
          )}
          {post.datetime && (
            <p style={{ color: 'var(--text-tertiary)' }} className="text-xs">
              🕐 {new Date(post.datetime).toLocaleString('ru-RU')}
            </p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isFull
            ? 'bg-red-500 text-white'
            : 'bg-green-500 text-white'
        }`}>
          {spotsLeft > 0 ? `${spotsLeft} мест` : 'Полно'}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Участников: {post.current_companions}/{post.max_companions}
          </span>
        </div>
        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
            initial={{ width: 0 }}
            animate={{ width: `${(post.current_companions / post.max_companions) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Interests */}
      {post.interests && post.interests.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.interests.map((interest) => (
            <span
              key={interest}
              className="text-xs px-2 py-1 bg-[var(--bg-tertiary)] rounded-full"
              style={{ color: 'var(--text-secondary)' }}
            >
              #{interest}
            </span>
          ))}
        </div>
      )}

      {/* Date */}
      <p style={{ color: 'var(--text-secondary)' }} className="text-xs mb-4">
        Создано: {new Date(post.created_at).toLocaleDateString('ru-RU')}
      </p>

      {/* Action Button */}
      <motion.button
        onClick={() => {
          if (isOwn && onManage) {
            onManage(post.id);
          } else if (!isOwn && onJoin) {
            onJoin(post.id);
          }
        }}
        disabled={isFull || isLoading}
        className={`w-full py-2 rounded-lg font-semibold transition-all ${
          isFull
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
        }`}
        whileHover={!isFull ? { scale: 1.05 } : {}}
        whileTap={!isFull ? { scale: 0.95 } : {}}
      >
        {isLoading ? '...' : isOwn ? 'Управлять' : isFull ? 'Полно' : 'Присоединиться'}
      </motion.button>
    </motion.div>
  );
};
