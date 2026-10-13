import React, { useState } from 'react';
import { Plus, Filter, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { ClosetItem, ClothingCategory } from '../../types';
import { useTranslation } from '../../i18n';
import { AddItemModal } from './AddItemModal';
import { ItemDetailModal } from './ItemDetailModal';

interface ClosetScreenProps {
  items: ClosetItem[];
  onAddItem: (item: Omit<ClosetItem, 'itemId' | 'createdAt' | 'wearCount' | 'lastWornAt'>) => void;
  onDeleteItem: (itemId: string) => void;
  onShopSimilar: (query: string) => void;
  selectedItemForView?: ClosetItem | null;
  onClearSelectedItem?: () => void;
}

export const ClosetScreen: React.FC<ClosetScreenProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onShopSimilar,
  selectedItemForView = null,
  onClearSelectedItem
}) => {
  const { t } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDetailItem, setActiveDetailItem] = useState<ClosetItem | null>(selectedItemForView);

  // Sync external selection
  React.useEffect(() => {
    if (selectedItemForView) {
      setActiveDetailItem(selectedItemForView);
    }
  }, [selectedItemForView]);

  const categories = [
    { id: 'all', label: t('allCategories') },
    { id: 'tops', label: t('catTops') },
    { id: 'bottoms', label: t('catBottoms') },
    { id: 'dresses', label: t('catDresses') },
    { id: 'outerwear', label: t('catOuterwear') },
    { id: 'shoes', label: t('catShoes') },
    { id: 'accessories', label: t('catAccessories') },
  ];

  const popularTags = ['confident', 'work', 'terracotta', 'cozy', 'casual', 'radiant', 'grounded'];

  const filteredItems = items.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    if (activeFilterTag) {
      const matchVibe = item.emotionalTags.includes(activeFilterTag);
      const matchUse = item.useCases.includes(activeFilterTag);
      const matchColor = item.colors.includes(activeFilterTag);
      if (!matchVibe && !matchUse && !matchColor) return false;
    }
    return true;
  });

  return (
    <div className="pb-24 pt-2">
      {/* Screen Header & Top Action Button (Cocoa Brown) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-cocoa-900 tracking-tight">
            {t('closetTitle')}
          </h1>
          <p className="text-xs text-cocoa-400 mt-0.5">
            {items.length} curated pieces in your intentional wardrobe
          </p>
        </div>

        {/* Prominent Cocoa Brown Button (#3C2F2F) */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-cocoa-600 hover:bg-cocoa-700 text-white font-bold text-sm shadow-warm-md hover:shadow-warm-lg active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 text-terracotta-400" />
          <span>{t('addNewItem')}</span>
        </button>
      </div>

      {/* Filter/Sort Ribbon: Horizontally scrolling pills */}
      <div className="space-y-2 mb-6">
        {/* Categories row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-4 py-2 rounded-2xl font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-terracotta-500 text-white shadow-terracotta scale-105'
                    : 'bg-white hover:bg-warm-100 text-cocoa-600 border border-warm-border'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Emotional Vibe & Occasion tags row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold uppercase text-cocoa-400 flex items-center gap-1 px-1">
            <Filter className="w-3 h-3" /> Vibe:
          </span>
          {popularTags.map((tag) => {
            const isTagActive = activeFilterTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveFilterTag(isTagActive ? null : tag)}
                className={`text-[11px] px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                  isTagActive
                    ? 'bg-cocoa-600 text-white font-bold shadow-sm'
                    : 'bg-warm-100 hover:bg-warm-200 text-cocoa-600'
                }`}
              >
                #{tag}
              </button>
            );
          })}
          {activeFilterTag && (
            <button
              onClick={() => setActiveFilterTag(null)}
              className="text-[11px] text-terracotta-600 hover:underline px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* The Grid: 2-column image grid for mobile */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.itemId}
              onClick={() => setActiveDetailItem(item)}
              className="group bg-white rounded-3xl overflow-hidden border border-warm-border hover:border-terracotta-300 shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Photo Card with overlay badges */}
              <div className="relative aspect-[3/4] bg-warm-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <span className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" /> View
                  </span>
                </div>

                {/* Emotional Vibe Pill */}
                {item.emotionalTags[0] && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-cocoa-900 backdrop-blur-sm shadow-sm border border-warm-border">
                      {item.emotionalTags[0]}
                    </span>
                  </div>
                )}

                {/* Wear Count Badge */}
                {item.wearCount > 0 && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-500/90 text-white backdrop-blur-sm shadow-sm">
                      {item.wearCount}x
                    </span>
                  </div>
                )}
              </div>

              {/* Card Meta */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-cocoa-900 group-hover:text-terracotta-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-cocoa-400 capitalize mt-0.5">
                    {item.category} • {item.useCases.slice(0, 2).join(', ')}
                  </p>
                </div>

                {/* Quick Shop Similar Link */}
                <div className="pt-2 mt-2 border-t border-warm-100 flex items-center justify-between text-[11px]">
                  <span className="text-cocoa-400 font-medium">
                    {item.colors[0] || 'Neutral'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShopSimilar(item.name);
                    }}
                    className="text-terracotta-600 hover:text-terracotta-700 font-bold flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" /> Shop
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-warm-border my-6">
          <Sparkles className="w-10 h-10 text-terracotta-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-cocoa-700 mb-2">
            {t('noItemsFound')}
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveFilterTag(null);
            }}
            className="text-xs text-terracotta-600 font-bold underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddItem}
      />

      {/* Item Detail Popup */}
      <ItemDetailModal
        item={activeDetailItem}
        onClose={() => {
          setActiveDetailItem(null);
          if (onClearSelectedItem) onClearSelectedItem();
        }}
        onShopSimilar={onShopSimilar}
        onDeleteItem={onDeleteItem}
      />
    </div>
  );
};
