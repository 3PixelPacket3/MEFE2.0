import React, { useState } from 'react';
import { Plus, X, Sparkles, Check, Calendar as CalendarIcon, Save, Trash2 } from 'lucide-react';
import { ClosetItem, Outfit } from '../../types';
import { useTranslation } from '../../i18n';

interface OutfitBuilderProps {
  closetItems: ClosetItem[];
  onSaveOutfit: (outfit: Omit<Outfit, 'outfitId' | 'createdAt' | 'updatedAt'>) => void;
  onLaunchAvatar: () => void;
}

export const OutfitBuilder: React.FC<OutfitBuilderProps> = ({
  closetItems,
  onSaveOutfit,
  onLaunchAvatar,
}) => {
  const { t } = useTranslation();

  const [stagedItems, setStagedItems] = useState<ClosetItem[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [moodTarget, setMoodTarget] = useState('High Confidence');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);

  const toggleStageItem = (item: ClosetItem) => {
    if (stagedItems.some(i => i.itemId === item.itemId)) {
      setStagedItems(stagedItems.filter(i => i.itemId !== item.itemId));
    } else {
      setStagedItems([...stagedItems, item]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outfitName.trim() || stagedItems.length === 0) return;

    onSaveOutfit({
      userId: 'usr_me_001',
      name: outfitName.trim(),
      itemIds: stagedItems.map(i => i.itemId),
      moodTarget: moodTarget.trim() || 'Empowered Energy',
      scheduledDates: scheduledDate ? [scheduledDate] : [],
      avatarCanvasState: {},
      previewImageUrl: stagedItems[0]?.imageUrl || null
    });

    setStagedItems([]);
    setOutfitName('');
    setIsSaveModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top 50%: Staging Canvas Drop Zone */}
      <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-warm-sm relative min-h-[320px] sm:min-h-[360px] flex flex-col justify-between canvas-grid-pattern">
        {/* Canvas Header */}
        <div className="flex items-center justify-between pb-3 border-b border-warm-100">
          <div>
            <h3 className="font-bold text-sm text-cocoa-900 flex items-center gap-1.5">
              <span>Staged Ensemble Canvas</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-warm-100 text-cocoa-600 font-semibold">
                {stagedItems.length} pieces
              </span>
            </h3>
            <p className="text-[11px] text-cocoa-400">
              Select wardrobe items from below to compose your styled look
            </p>
          </div>

          <div className="flex items-center gap-2">
            {stagedItems.length > 0 && (
              <button
                onClick={() => setStagedItems([])}
                className="text-xs text-cocoa-400 hover:text-cocoa-700 flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-warm-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={() => {
                if (stagedItems.length === 0) {
                  alert("Tap items below to stage your ensemble first!");
                  return;
                }
                setIsSaveModalOpen(true);
              }}
              disabled={stagedItems.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs shadow-terracotta transition-all ${
                stagedItems.length > 0
                  ? 'bg-terracotta-500 hover:bg-terracotta-600 text-white'
                  : 'bg-warm-200 text-cocoa-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('saveOutfitBtn')}</span>
            </button>
          </div>
        </div>

        {/* Drop Zone Visualizer */}
        <div className="flex-1 flex items-center justify-center p-4">
          {stagedItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              {stagedItems.map((item) => (
                <div
                  key={item.itemId}
                  className="relative group bg-warm-50 rounded-2xl overflow-hidden border border-warm-border p-2 flex flex-col items-center"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shadow-sm"
                  />
                  <p className="text-xs font-bold text-cocoa-900 mt-2 truncate w-full text-center">
                    {item.name}
                  </p>
                  <span className="text-[10px] text-cocoa-400 capitalize">
                    {item.category}
                  </span>
                  <button
                    onClick={() => toggleStageItem(item)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 text-cocoa-500 hover:bg-red-50 hover:text-red-500 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto text-terracotta-500 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-cocoa-600">
                {t('dropZonePlaceholder')}
              </p>
              <button
                onClick={onLaunchAvatar}
                className="mt-3 text-xs text-terracotta-600 hover:text-terracotta-700 font-bold underline inline-flex items-center gap-1"
              >
                Or open 90s Clueless Avatar Studio →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom 50%: Scrollable Wardrobe Carousel / Grid */}
      <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-warm-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-cocoa-600">
            Tap Closet Items to Add to Ensemble
          </h4>
          <span className="text-xs text-cocoa-400">
            {closetItems.length} available items
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto p-1">
          {closetItems.map((item) => {
            const isStaged = stagedItems.some(i => i.itemId === item.itemId);
            return (
              <div
                key={item.itemId}
                onClick={() => toggleStageItem(item)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all border aspect-square ${
                  isStaged
                    ? 'border-terracotta-500 ring-2 ring-terracotta-500/50 scale-95 shadow-terracotta'
                    : 'border-warm-border hover:border-terracotta-300'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/60 to-transparent flex flex-col justify-end p-1.5">
                  <p className="text-[10px] font-bold text-white truncate leading-tight">
                    {item.name}
                  </p>
                </div>
                {isStaged && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-terracotta-500 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-border">
            <h3 className="font-bold text-lg text-cocoa-900 mb-1">Save Styled Ensemble</h3>
            <p className="text-xs text-cocoa-400 mb-4">
              Bundle your {stagedItems.length} selected pieces into an Outfit document
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  {t('outfitNameLabel')} *
                </label>
                <input
                  type="text"
                  required
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="e.g. Executive Power Thursday"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-50 text-sm focus:bg-white text-cocoa-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  {t('moodTargetLabel')}
                </label>
                <input
                  type="text"
                  value={moodTarget}
                  onChange={(e) => setMoodTarget(e.target.value)}
                  placeholder="e.g. High Confidence & Clarity"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-50 text-sm focus:bg-white text-cocoa-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  {t('scheduleDatesLabel')}
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-50 text-sm focus:bg-white text-cocoa-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-warm-100 font-bold text-xs text-cocoa-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta"
                >
                  {t('saveOutfitBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
