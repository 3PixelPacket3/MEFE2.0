import React from 'react';
import { X, ShoppingBag, Trash2, Calendar, Sparkles, Tag, HeartHandshake } from 'lucide-react';
import { ClosetItem } from '../../types';
import { useTranslation } from '../../i18n';

interface ItemDetailModalProps {
  item: ClosetItem | null;
  onClose: () => void;
  onShopSimilar: (query: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onShopSimilar,
  onDeleteItem
}) => {
  const { t } = useTranslation();

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-cocoa-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-warm-border max-h-[92vh] flex flex-col">
        {/* Photo Header */}
        <div className="relative h-72 sm:h-80 bg-warm-100 flex-shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/60 via-transparent to-black/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-cocoa-900 shadow-md backdrop-blur-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Pill */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-terracotta-500 text-white shadow-terracotta">
              {item.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <h2 className="font-display font-bold text-2xl text-cocoa-900 leading-tight">
              {item.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-cocoa-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {item.wearCount > 0
                  ? t('wornCount', { count: item.wearCount })
                  : t('neverWorn')}
              </span>
              {item.lastWornAt && (
                <span>• {t('lastWorn', { date: new Date(item.lastWornAt).toLocaleDateString() })}</span>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3 pt-2">
            {/* Vibe / Emotional Tags */}
            <div className="p-3 bg-terracotta-50/60 rounded-2xl border border-terracotta-200/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-terracotta-800 uppercase tracking-wide mb-1.5">
                <HeartHandshake className="w-4 h-4 text-terracotta-500" />
                <span>Vibe & Emotional Energy</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.emotionalTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-terracotta-100 text-terracotta-900 border border-terracotta-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Use For / Occasions */}
            <div className="p-3 bg-warm-50 rounded-2xl border border-warm-border">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cocoa-700 uppercase tracking-wide mb-1.5">
                <Tag className="w-4 h-4 text-cocoa-500" />
                <span>Use For / Occasions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.useCases.map((useCase) => (
                  <span
                    key={useCase}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cocoa-100 text-cocoa-800"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <span className="text-xs font-bold text-cocoa-400 uppercase tracking-wider block mb-1">
                Colors
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.colors.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-0.5 rounded-full text-xs bg-warm-100 text-cocoa-700 capitalize border border-warm-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-warm-50 border-t border-warm-border flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to remove this piece from your wardrobe?')) {
                onDeleteItem(item.itemId);
                onClose();
              }
            }}
            className="p-3 rounded-2xl bg-warm-200/60 hover:bg-red-50 hover:text-red-600 text-cocoa-500 transition-colors"
            title={t('deleteItem')}
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              onClose();
              onShopSimilar(item.name);
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-sm shadow-terracotta flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('shopSimilar')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
