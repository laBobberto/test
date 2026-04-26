import { useState, useEffect } from 'react';
import { currencyAPI } from '../services/api';
import Navigation from '../components/Navigation';
import { CurrencyBalance } from '../components/CurrencyBalance';
import { StoreItemCard } from '../components/StoreItemCard';
import { StatsCardSkeleton } from '../components/skeletons/StatsCardSkeleton';
import type { StoreItem, VirtualCurrency, Purchase } from '../types';
import { toast } from 'sonner';

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currency, setCurrency] = useState<VirtualCurrency | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'store' | 'purchases'>('store');

  useEffect(() => {
    loadData();
  }, [selectedCategory, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'store') {
        const [itemsData, currencyData] = await Promise.all([
          currencyAPI.getStoreItems(selectedCategory),
          currencyAPI.getBalance(),
        ]);
        setItems(itemsData);
        setCurrency(currencyData);
      } else {
        const [purchasesData, currencyData] = await Promise.all([
          currencyAPI.getPurchases(),
          currencyAPI.getBalance(),
        ]);
        setPurchases(purchasesData);
        setCurrency(currencyData);
      }
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
      const result = await currencyAPI.purchaseItem(itemId);

      // Show promo code in toast
      if (result.promo_code) {
        toast.success(
          <div>
            <div className="font-bold mb-1">Товар куплен! 🎉</div>
            <div className="text-sm">Промокод: <span className="font-mono font-bold">{result.promo_code}</span></div>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.success('Товар куплен! 🎉');
      }

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

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border-primary)]">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === 'store'
                ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Магазин
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === 'purchases'
                ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Мои покупки
          </button>
        </div>

        {activeTab === 'store' ? (
          <>
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
          </>
        ) : (
          <>
            {/* Purchases List */}
            {purchases.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4">🎁</div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
                  У вас пока нет покупок
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {purchase.item_title}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3">
                          {purchase.item_description}
                        </p>
                        {purchase.promo_code && (
                          <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg mb-2">
                            <div style={{ color: 'var(--text-secondary)' }} className="text-xs mb-1">
                              Промокод:
                            </div>
                            <div className="font-mono font-bold text-lg gradient-text">
                              {purchase.promo_code}
                            </div>
                          </div>
                        )}
                        <div style={{ color: 'var(--text-tertiary)' }} className="text-xs">
                          Куплено: {new Date(purchase.purchased_at).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold gradient-text">{purchase.price}</div>
                        <div style={{ color: 'var(--text-secondary)' }} className="text-xs">баллов</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
