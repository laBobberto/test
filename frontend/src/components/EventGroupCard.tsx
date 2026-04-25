import React from 'react';
import { motion } from 'framer-motion';
import type { EventGroup } from '../types';

interface EventGroupCardProps {
  group: EventGroup;
  onJoin?: (id: number) => void;
  onLeave?: (id: number) => void;
  isMember?: boolean;
  isLoading?: boolean;
}

export const EventGroupCard: React.FC<EventGroupCardProps> = ({
  group,
  onJoin,
  onLeave,
  isMember,
  isLoading,
}) => {
  const spotsLeft = group.max_members - group.members.length;
  const isFull = spotsLeft <= 0;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {group.name}
        </h3>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3">
          {group.description}
        </p>
      </div>

      {/* Meeting Info */}
      {group.meeting_point && (
        <div className="mb-3 p-2 bg-[var(--bg-tertiary)] rounded">
          <p style={{ color: 'var(--text-secondary)' }} className="text-xs mb-1">
            📍 Место встречи:
          </p>
          <p className="font-semibold text-sm">{group.meeting_point}</p>
        </div>
      )}

      {group.meeting_time && (
        <div className="mb-3 p-2 bg-[var(--bg-tertiary)] rounded">
          <p style={{ color: 'var(--text-secondary)' }} className="text-xs mb-1">
            🕐 Время встречи:
          </p>
          <p className="font-semibold text-sm">{group.meeting_time}</p>
        </div>
      )}

      {/* Members */}
      <div className="mb-4">
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
          Участников: {group.members.length}/{group.max_members}
        </p>
        <div className="flex -space-x-2">
          {group.members.slice(0, 5).map((member) => (
            <div
              key={member.user_id}
              className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center border-2 border-[var(--bg-secondary)]"
              title={member.username}
            >
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.username}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <span className="text-xs font-semibold text-white">
                  {member.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {group.members.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border-2 border-[var(--bg-secondary)]">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                +{group.members.length - 5}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        onClick={() => {
          if (isMember && onLeave) {
            onLeave(group.id);
          } else if (!isMember && onJoin) {
            onJoin(group.id);
          }
        }}
        disabled={isFull || isLoading}
        className={`w-full py-2 rounded-lg font-semibold transition-all ${
          isFull && !isMember
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
        }`}
        whileHover={!isFull || isMember ? { scale: 1.05 } : {}}
        whileTap={!isFull || isMember ? { scale: 0.95 } : {}}
      >
        {isLoading ? '...' : isMember ? 'Покинуть' : isFull ? 'Полно' : 'Вступить'}
      </motion.button>
    </motion.div>
  );
};
