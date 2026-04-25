import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';
import Navigation from '../components/Navigation';
import { BlogPostCard } from '../components/BlogPostCard';
import { StatsCardSkeleton } from '../components/skeletons/StatsCardSkeleton';
import type { BlogPost, BlogCategory } from '../types';
import { toast } from 'sonner';

export default function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        blogAPI.getPosts({ category: selectedCategory }),
        blogAPI.getCategories(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading blog data:', error);
      toast.error('Ошибка при загрузке блога');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await blogAPI.searchPosts(query);
        setPosts(results);
      } catch (error) {
        console.error('Error searching posts:', error);
        toast.error('Ошибка при поиске');
      }
    } else {
      loadData();
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (searchQuery) return true;
    if (selectedCategory) return post.category === selectedCategory;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen brutal-grid">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCardSkeleton count={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen brutal-grid">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold syne gradient-text mb-2">Блог</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Новости, события и полезные советы о Санкт-Петербурге
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Поиск постов..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input w-full"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setSelectedCategory(undefined);
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              selectedCategory === undefined
                ? 'bg-[var(--accent-primary)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {cat.icon} {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
              Посты не найдены
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BlogPostCard
                key={post.id}
                post={post}
                onClick={(slug) => navigate(`/blog/${slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
