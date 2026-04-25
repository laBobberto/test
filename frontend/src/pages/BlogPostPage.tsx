import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { blogAPI } from '../services/api';
import Navigation from '../components/Navigation';
import { StatsCardSkeleton } from '../components/skeletons/StatsCardSkeleton';
import type { BlogPost } from '../types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const postData = await blogAPI.getPost(slug);
      setPost(postData);
      setIsLiked(postData.is_liked || false);

      // Load related posts
      const trendingPosts = await blogAPI.getTrendingPosts(3);
      setRelatedPosts(trendingPosts.filter((p) => p.id !== postData.id));
    } catch (error) {
      console.error('Error loading post:', error);
      toast.error('Ошибка при загрузке поста');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      await blogAPI.likePost(post.id);
      setIsLiked(!isLiked);
      setPost({
        ...post,
        likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
      });
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Ошибка при лайке');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen brutal-grid">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <StatsCardSkeleton count={1} />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen brutal-grid">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
              Пост не найден
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen brutal-grid">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Hero Image */}
          {post.image_url && (
            <div className="w-full h-96 bg-[var(--bg-tertiary)] rounded-2xl mb-8 overflow-hidden">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold px-3 py-1 bg-[var(--bg-tertiary)] rounded-full">
                {post.category}
              </span>
              <span style={{ color: 'var(--text-secondary)' }} className="text-sm">
                {new Date(post.published_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-5xl font-bold syne gradient-text mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              {post.author_avatar && (
                <img
                  src={post.author_avatar}
                  alt={post.author}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {post.author}
                </p>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  Автор
                </p>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center gap-6 py-4 border-y border-[var(--border-primary)]">
              <span style={{ color: 'var(--text-secondary)' }} className="text-sm">
                👁️ {post.views_count} просмотров
              </span>
              <motion.button
                onClick={handleLike}
                className={`flex items-center gap-2 font-semibold transition-colors ${
                  isLiked ? 'text-red-500' : 'text-[var(--text-secondary)]'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLiked ? '❤️' : '🤍'} {post.likes_count}
              </motion.button>
              <motion.button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Ссылка скопирована');
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                🔗 Поделиться
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold syne gradient-text my-4" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-bold syne my-3" style={{ color: 'var(--text-primary)' }} {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-bold my-2" style={{ color: 'var(--text-primary)' }} {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="my-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }} {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] underline" {...props} />
                ),
                code: ({ node, inline, ...props }) => (
                  <code
                    className={`${
                      inline
                        ? 'bg-[var(--bg-tertiary)] px-2 py-1 rounded text-[var(--accent-primary)]'
                        : 'block bg-[var(--bg-tertiary)] p-4 rounded-lg my-4 overflow-x-auto'
                    }`}
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-[var(--accent-primary)] pl-4 my-4 italic"
                    style={{ color: 'var(--text-secondary)' }}
                    {...props}
                  />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-12 pb-12 border-b border-[var(--border-primary)]">
              <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Теги:
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[var(--bg-tertiary)] rounded-full text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold syne mb-6" style={{ color: 'var(--text-primary)' }}>
                Похожие посты
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <motion.div
                    key={relatedPost.id}
                    className="card cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  >
                    {relatedPost.image_url && (
                      <div className="w-full h-32 bg-[var(--bg-tertiary)] rounded-lg mb-3 overflow-hidden">
                        <img
                          src={relatedPost.image_url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {relatedPost.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">
                      {new Date(relatedPost.published_at).toLocaleDateString('ru-RU')}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
