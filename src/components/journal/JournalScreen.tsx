import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BookHeart,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';
import { JournalEntry, ClosetItem, Outfit } from '../../types';
import { useTranslation } from '../../i18n';

interface JournalScreenProps {
  journalEntries: JournalEntry[];
  closetItems: ClosetItem[];
  outfits: Outfit[];
  onAddJournalEntry: (entry: Omit<JournalEntry, 'journalId' | 'createdAt'>) => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  journalEntries,
  closetItems,
  outfits,
  onAddJournalEntry
}) => {
  const { t } = useTranslation();

  const [moodScore, setMoodScore] = useState<number>(8);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(outfits[0]?.outfitId || null);
  const [selectedWornItemIds, setSelectedWornItemIds] = useState<string[]>([]);
  const [emotionsLogged, setEmotionsLogged] = useState<string[]>(['confident', 'grounded']);
  const [entryText, setEntryText] = useState('');
  const [isOutfitPickerOpen, setIsOutfitPickerOpen] = useState(false);

  const availableEmotions = [
    'confident',
    'energized',
    'grounded',
    'calm',
    'creative',
    'radiant',
    'empowered',
    'anxious',
    'restless',
    'exhausted'
  ];

  const toggleEmotion = (emotion: string) => {
    if (emotionsLogged.includes(emotion)) {
      setEmotionsLogged(emotionsLogged.filter(e => e !== emotion));
    } else {
      setEmotionsLogged([...emotionsLogged, emotion]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryText.trim()) return;

    // Calculate normalized sentiment (-1.0 to 1.0)
    const normalizedSentiment = Number(((moodScore - 5.5) / 4.5).toFixed(2));

    // Compile worn item IDs from linked outfit or direct items
    let finalWornItemIds = [...selectedWornItemIds];
    if (selectedOutfitId) {
      const outfit = outfits.find(o => o.outfitId === selectedOutfitId);
      if (outfit) {
        finalWornItemIds = Array.from(new Set([...finalWornItemIds, ...outfit.itemIds]));
      }
    }

    onAddJournalEntry({
      userId: 'usr_me_001',
      date: new Date().toISOString().split('T')[0],
      moodScore,
      emotionsLogged,
      outfitId: selectedOutfitId,
      wornItemIds: finalWornItemIds,
      entryText: entryText.trim(),
      sentimentScore: normalizedSentiment
    });

    // Trigger celebration confetti!
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E2725B', '#3C2F2F', '#FAF6F0', '#FFB088']
    });

    setEntryText('');
  };

  const selectedOutfit = outfits.find(o => o.outfitId === selectedOutfitId);

  // Helper for mood emoji
  const getMoodFace = (score: number) => {
    if (score >= 8) return <Smile className="w-5 h-5 text-emerald-600" />;
    if (score >= 5) return <Meh className="w-5 h-5 text-amber-600" />;
    return <Frown className="w-5 h-5 text-terracotta-600" />;
  };

  return (
    <div className="pb-24 pt-2 space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-cocoa-900 tracking-tight">
          {t('journalTitle')}
        </h1>
        <p className="text-xs text-cocoa-400 mt-0.5">
          Capture the emotional pulse of your wardrobe choices
        </p>
      </div>

      {/* Daily Input Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-warm-border shadow-warm-md">
        <div className="flex items-center justify-between pb-4 border-b border-warm-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-terracotta-100 flex items-center justify-center text-terracotta-600">
              <BookHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-cocoa-900">
                {t('dailyCheckin')}
              </h2>
              <p className="text-[11px] text-cocoa-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-warm-100 text-cocoa-700 rounded-full">
            Today's Check-in
          </span>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-5">
          {/* 1-10 Mood Slider (styled in gradients of Red/Brown) */}
          <div className="p-4 bg-warm-50 rounded-2xl border border-warm-border">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-cocoa-800 uppercase tracking-wider flex items-center gap-1.5">
                {getMoodFace(moodScore)}
                <span>{t('moodScoreLabel')}</span>
              </label>
              <span className="text-lg font-black text-terracotta-600">
                {moodScore} <span className="text-xs font-semibold text-cocoa-400">/ 10</span>
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={moodScore}
              onChange={(e) => setMoodScore(Number(e.target.value))}
              className="w-full my-2"
            />

            <div className="flex justify-between text-[10px] font-semibold text-cocoa-400 mt-1">
              <span>{t('moodLow')}</span>
              <span>{t('moodNeutral')}</span>
              <span className="text-terracotta-600">{t('moodHigh')}</span>
            </div>
          </div>

          {/* "What did you wear?" picker */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1.5">
              {t('whatDidYouWear')}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOutfitPickerOpen(true)}
                className="flex-1 p-3 rounded-2xl bg-warm-50 hover:bg-warm-100 border border-warm-border flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Layers className="w-4 h-4 text-terracotta-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-cocoa-800 truncate">
                    {selectedOutfit ? selectedOutfit.name : 'Select Outfit or Wardrobe Item'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-terracotta-600">Change</span>
              </button>
            </div>
          </div>

          {/* Emotion Pills Multi-Selector */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1.5">
              {t('emotionsLoggedLabel')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableEmotions.map((emotion) => {
                const isSelected = emotionsLogged.includes(emotion);
                return (
                  <button
                    type="button"
                    key={emotion}
                    onClick={() => toggleEmotion(emotion)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      isSelected
                        ? 'bg-terracotta-500 text-white font-bold shadow-terracotta'
                        : 'bg-warm-100 hover:bg-warm-200 text-cocoa-700'
                    }`}
                  >
                    #{emotion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Free-form Text Reflection */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1.5">
              {t('journalReflectionLabel')}
            </label>
            <textarea
              required
              rows={3}
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder={t('journalPlaceholder')}
              className="w-full p-3 rounded-2xl border border-warm-border bg-warm-50 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-terracotta-500 text-cocoa-900 resize-none leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-cocoa-600 hover:bg-cocoa-700 text-white font-bold text-sm shadow-warm-md hover:shadow-warm-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-terracotta-400" />
            <span>{t('submitJournalBtn')}</span>
          </button>
        </form>
      </div>

      {/* History Feed: Reverse-chronological single column scroll */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-cocoa-900 uppercase tracking-wider">
            {t('journalHistoryTitle')} ({journalEntries.length})
          </h3>
          <span className="text-[11px] text-cocoa-400">
            Feeds Gemini AI Insights
          </span>
        </div>

        {journalEntries.map((entry) => {
          const linkedOutfit = outfits.find(o => o.outfitId === entry.outfitId);
          return (
            <div
              key={entry.journalId}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-warm-border shadow-warm-sm hover:shadow-warm-md transition-shadow space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-cocoa-400" />
                  <span className="text-xs font-bold text-cocoa-800">
                    {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Mood score badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-50 border border-terracotta-200">
                  {getMoodFace(entry.moodScore)}
                  <span className="text-xs font-black text-terracotta-700">
                    {entry.moodScore}/10
                  </span>
                </div>
              </div>

              {/* Reflection text */}
              <p className="text-xs sm:text-sm text-cocoa-700 leading-relaxed font-normal">
                "{entry.entryText}"
              </p>

              {/* Worn outfit & Emotions */}
              <div className="pt-2 border-t border-warm-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {entry.emotionsLogged.map((e) => (
                    <span
                      key={e}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warm-100 text-cocoa-600"
                    >
                      #{e}
                    </span>
                  ))}
                </div>

                {linkedOutfit && (
                  <span className="text-[11px] font-bold text-terracotta-600 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {linkedOutfit.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Outfit Selector Modal */}
      {isOutfitPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-warm-border">
            <div className="flex items-center justify-between pb-3 border-b border-warm-border">
              <h3 className="font-bold text-sm text-cocoa-900">
                {t('selectOutfitOrItem')}
              </h3>
              <button
                onClick={() => setIsOutfitPickerOpen(false)}
                className="p-1 rounded-full hover:bg-warm-100 text-cocoa-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2 max-h-64 overflow-y-auto">
              {outfits.map((outfit) => (
                <button
                  key={outfit.outfitId}
                  type="button"
                  onClick={() => {
                    setSelectedOutfitId(outfit.outfitId);
                    setIsOutfitPickerOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedOutfitId === outfit.outfitId
                      ? 'bg-terracotta-50 border-terracotta-500 text-terracotta-900'
                      : 'bg-warm-50 hover:bg-warm-100 border-warm-border text-cocoa-800'
                  }`}
                >
                  <div>
                    <p className="font-bold">{outfit.name}</p>
                    <p className="text-[10px] text-cocoa-400">{outfit.moodTarget}</p>
                  </div>
                  {selectedOutfitId === outfit.outfitId && (
                    <CheckCircle2 className="w-4 h-4 text-terracotta-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
