import React from 'react';
import { motion } from 'framer-motion';
import type { BlogPost } from '../types';

interface BlogPostCardProps {
  post: BlogPost;
  onClick?: (slug: string) => void;
}

const categoryIcons: Record<string, string> = {
  news: '📰',
  events: '🎉',
  guide: '📚',
  tips: '💡',
};

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, onClick }) => {
  return (
    <motion.div
      className="card overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick?.(post.slug)}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      {post.image_url && (
        <div className="w-full h-48 bg-[var(--bg-tertiary)] rounded-lg mb-4 overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}

      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-1 bg-[var(--bg-tertiary)] rounded">
          {categoryIcons[post.category]} {post.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
        {post.title}
      </h3>

      {/* Excerpt */}
      <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3 line-clamp-2">
        {post.excerpt || post.summary}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-2">
          <span>{typeof post.author === 'string' ? post.author : post.author?.username}</span>
          <span>•</span>
          <span>{new Date(post.published_at || post.created_at).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-primary)] text-sm">
        <span style={{ color: 'var(--text-secondary)' }}>👁️ {post.views_count || post.views || 0}</span>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={`flex items-center gap-1 transition-colors ${
            post.is_liked ? 'text-red-500' : 'text-[var(--text-secondary)]'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ❤️ {post.likes_count || post.likes || 0}
        </motion.button>
      </div>
    </motion.div>
  );
};
