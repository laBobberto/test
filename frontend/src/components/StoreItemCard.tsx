import React from 'react';
import { motion } from 'framer-motion';
import type { StoreItem } from '../types';

interface StoreItemCardProps {
  item: StoreItem;
  onPurchase?: (id: number) => void;
  isLoading?: boolean;
}

const categoryLabels: Record<string, string> = {
  discount: '🏷️ Скидка',
  premium: '⭐ Премиум',
  cosmetic: '🎨 Косметика',
  physical: '📦 Физический',
};

export const StoreItemCard: React.FC<StoreItemCardProps> = ({
  item,
  onPurchase,
  isLoading,
}) => {
  return (
    <motion.div
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      {item.image_url && (
        <div className="w-full h-40 bg-[var(--bg-tertiary)] rounded-lg mb-4 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Category Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-2 py-1 bg-[var(--bg-tertiary)] rounded">
          {categoryLabels[item.category] || item.category}
        </span>
        {!item.available && (
          <span className="text-xs font-semibold px-2 py-1 bg-red-500 text-white rounded">
            Нет в наличии
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {item.title}
      </h3>

      {/* Description */}
      <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3">
        {item.description}
      </p>

      {/* Partner */}
      {item.partner && (
        <p style={{ color: 'var(--text-tertiary)' }} className="text-xs mb-3">
          Партнер: {item.partner}
        </p>
      )}

      {/* Stock */}
      {item.stock !== undefined && (
        <p style={{ color: 'var(--text-secondary)' }} className="text-xs mb-3">
          Осталось: {item.stock} шт.
        </p>
      )}

      {/* Price and Button */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-primary)]">
        <div className="text-2xl font-bold gradient-text">{item.price}</div>
        <motion.button
          onClick={() => onPurchase?.(item.id)}
          disabled={!item.available || isLoading}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            item.available
              ? 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
          whileHover={item.available ? { scale: 1.05 } : {}}
          whileTap={item.available ? { scale: 0.95 } : {}}
        >
          {isLoading ? '...' : 'Купить'}
        </motion.button>
      </div>
    </motion.div>
  );
};
