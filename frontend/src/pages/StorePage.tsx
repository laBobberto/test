import { useState, useEffect } from 'react';
import { currencyAPI } from '../services/api';
import Navigation from '../components/Navigation';
import { CurrencyBalance } from '../components/CurrencyBalance';
import { StoreItemCard } from '../components/StoreItemCard';
import { StatsCardSkeleton } from '../components/skeletons/StatsCardSkeleton';
import type { StoreItem, VirtualCurrency } from '../types';
import { toast } from 'sonner';

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [currency, setCurrency] = useState<VirtualCurrency | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, currencyData] = await Promise.all([
        currencyAPI.getStoreItems(selectedCategory),
        currencyAPI.getBalance(),
      ]);
      setItems(itemsData);
      setCurrency(currencyData);
    } catch (error) {
      console.error('Error loading store data:', error);
      toast.error('Ошибка при загрузке магазина');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId: number) => {
    try {
      setPurchasing(itemId);
      await currencyAPI.purchaseItem(itemId);
      toast.success('Товар куплен! 🎉');
      loadData();
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast.error('Ошибка при покупке товара');
    } finally {
      setPurchasing(null);
    }
  };

  const categories = [
    { id: 'discount', label: '🏷️ Скидки' },
    { id: 'premium', label: '⭐ Премиум' },
    { id: 'cosmetic', label: '🎨 Косметика' },
    { id: 'physical', label: '📦 Физические' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen brutal-grid">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCardSkeleton count={4} />
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold syne gradient-text mb-2">Магазин</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Обменивайте монеты на награды и скидки
            </p>
          </div>
          {currency && (
            <CurrencyBalance balance={currency.balance} />
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              selectedCategory === undefined
                ? 'bg-[var(--accent-primary)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            Все товары
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🛍️</div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
              Товары в этой категории не найдены
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <StoreItemCard
                key={item.id}
                item={item}
                onPurchase={handlePurchase}
                isLoading={purchasing === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
