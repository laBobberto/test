import { useState, useEffect } from 'react';
import { currencyAPI } from '../services/api';
import Navigation from '../components/Navigation';
import { StatsCardSkeleton } from '../components/skeletons/StatsCardSkeleton';
import type { Purchase } from '../types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'used'>('active');

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await currencyAPI.getPurchases();
      setPurchases(data);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error('Ошибка при загрузке покупок');
    } finally {
      setLoading(false);
    }
  };

  const handleUseItem = async (purchaseId: number) => {
    try {
      await currencyAPI.useItem(purchaseId);
      toast.success('Товар активирован!');
      loadPurchases();
    } catch (error) {
      console.error('Error using item:', error);
      toast.error('Ошибка при активации товара');
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    if (activeTab === 'active') return p.status === 'completed' || p.status === 'pending';
    return p.status === 'used';
  });

  if (loading) {
    return (
      <div className="min-h-screen brutal-grid">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCardSkeleton count={2} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen brutal-grid">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold syne gradient-text mb-2">Мои покупки</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            История ваших покупок и активные промокоды
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border-primary)]">
          {(['active', 'used'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition-all ${
                activeTab === tab
                  ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab === 'active' && 'Активные'}
              {tab === 'used' && 'Использованные'}
            </button>
          ))}
        </div>

        {/* Purchases List */}
        {filteredPurchases.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
              {activeTab === 'active' ? 'Нет активных покупок' : 'Нет использованных товаров'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((purchase, index) => (
              <motion.div
                key={purchase.id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {purchase.item_title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span>Цена: {purchase.price} монет</span>
                      <span>
                        Куплено: {new Date(purchase.purchased_at).toLocaleDateString('ru-RU')}
                      </span>
                      {purchase.status === 'used' && purchase.used_at && (
                        <span>
                          Использовано: {new Date(purchase.used_at).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </div>
                    {purchase.code && (
                      <div className="mt-3 p-2 bg-[var(--bg-tertiary)] rounded">
                        <p style={{ color: 'var(--text-secondary)' }} className="text-xs mb-1">
                          Код активации:
                        </p>
                        <p className="font-mono font-semibold gradient-text">{purchase.code}</p>
                      </div>
                    )}
                  </div>
                  {purchase.status === 'completed' && (
                    <motion.button
                      onClick={() => handleUseItem(purchase.id)}
                      className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:bg-[var(--accent-secondary)] transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Использовать
                    </motion.button>
                  )}
                  {purchase.status === 'used' && (
                    <div className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">
                      ✓ Использовано
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
