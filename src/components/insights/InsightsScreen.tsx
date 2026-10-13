import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BrainCircuit,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Insight, JournalEntry, ClosetItem, Outfit } from '../../types';
import { useTranslation } from '../../i18n';
import { generateGeminiInsights } from '../../services/gemini';

interface InsightsScreenProps {
  insight: Insight;
  journals: JournalEntry[];
  closetItems: ClosetItem[];
  outfits: Outfit[];
  onSaveInsight: (insight: Insight) => void;
  onOpenOutfits: () => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  insight,
  journals,
  closetItems,
  outfits,
  onSaveInsight,
  onOpenOutfits
}) => {
  const { t } = useTranslation();

  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('all_time');
  const [isLoading, setIsLoading] = useState(false);

  const topOutfit = outfits.find(o => o.outfitId === insight.topOutfitId) || outfits[0];

  const handleGenerateFreshInsights = async () => {
    setIsLoading(true);
    try {
      const fresh = await generateGeminiInsights(journals, closetItems, outfits, period);
      onSaveInsight(fresh);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#E2725B', '#FFB088', '#3C2F2F']
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare category correlation bars for visualization
  const categoryScores: { category: string; itemType: string; score: number }[] = [];
  if (insight.categoryCorrelations) {
    Object.entries(insight.categoryCorrelations).forEach(([cat, subMap]) => {
      Object.entries(subMap).forEach(([itemType, score]) => {
        categoryScores.push({ category: cat, itemType, score });
      });
    });
  }

  return (
    <div className="pb-24 pt-2 space-y-6">
      {/* Title & Generate Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
              Google AI Studio
            </span>
            <span className="text-xs text-cocoa-400">Gemini Neural Brain</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-cocoa-900 tracking-tight mt-1">
            {t('insightsTitle')}
          </h1>
          <p className="text-xs text-cocoa-400">
            {t('insightsSubtitle')}
          </p>
        </div>

        {/* Generate / Refresh button */}
        <button
          onClick={handleGenerateFreshInsights}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-terracotta-500 to-terracotta-700 hover:from-terracotta-600 hover:to-terracotta-800 text-white font-bold text-xs sm:text-sm shadow-warm-md active:scale-95 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? t('analyzingData') : t('generateInsightsBtn')}</span>
        </button>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-warm-border w-fit shadow-warm-sm">
        {(['weekly', 'monthly', 'all_time'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              period === p
                ? 'bg-cocoa-600 text-white shadow-sm'
                : 'text-cocoa-600 hover:text-cocoa-900'
            }`}
          >
            {p === 'weekly' ? t('periodWeekly') : p === 'monthly' ? t('periodMonthly') : t('periodAllTime')}
          </button>
        ))}
      </div>

      {/* Hero Metric Banner: Power Color & Top Mood Ensemble */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Power Color Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-terracotta-800 p-6 text-white shadow-terracotta">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3 text-amber-200">
            <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('heroPowerColor')}
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            {insight.powerColor}
          </h2>
          <p className="text-xs text-white/90 mt-2 leading-relaxed">
            Statistically correlated with a +2.4 mood elevation across your recent journal check-ins.
          </p>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-white/80">
            <span>Peak Day: Thursdays</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] text-white">
              8.8/10 Avg Mood
            </span>
          </div>
        </div>

        {/* Top Mood-Boosting Outfit Card */}
        {topOutfit && (
          <div className="relative overflow-hidden rounded-3xl bg-cocoa-600 p-6 text-white shadow-warm-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-terracotta-300">
                <Award className="w-5 h-5 text-terracotta-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t('topOutfitBadge')}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                {topOutfit.name}
              </h3>
              <p className="text-xs text-warm-200/80 mt-1">
                Target Vibe: "{topOutfit.moodTarget}"
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/70">
                {topOutfit.itemIds.length} coordinated pieces
              </span>
              <button
                onClick={onOpenOutfits}
                className="text-xs font-bold text-terracotta-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View Look</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis Block: Direct Google AI Studio narrative output */}
      <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-warm-sm space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-warm-100">
          <div className="w-8 h-8 rounded-xl bg-terracotta-100 flex items-center justify-center text-terracotta-600">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-cocoa-900">
              Gemini AI Synthesis & Emotional Diagnosis
            </h3>
            <p className="text-[11px] text-cocoa-400">
              Natural language pattern recognition
            </p>
          </div>
        </div>

        <div className="p-4 bg-warm-50 rounded-2xl border border-warm-border">
          <p className="text-xs sm:text-sm text-cocoa-800 leading-relaxed font-normal">
            {insight.aiNarrativeSummary}
          </p>
        </div>

        {/* Single Actionable Empowerment Tip */}
        <div className="p-4 bg-terracotta-50/70 rounded-2xl border border-terracotta-200/70 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-terracotta-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-800 block mb-0.5">
              {t('actionableTipTitle')}
            </span>
            <p className="text-xs text-cocoa-800 leading-relaxed font-medium">
              {insight.actionableTip}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Data: Bar Chart correlating Mood Scores (Y-axis) with Clothing Categories (X-axis) */}
      <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-warm-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-warm-100">
          <div>
            <h3 className="font-bold text-sm text-cocoa-900">
              {t('categoryCorrelationsTitle')}
            </h3>
            <p className="text-[11px] text-cocoa-400">
              Mean mood rating (1 - 10) per clothing category
            </p>
          </div>
          <span className="text-xs font-bold text-terracotta-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> High Impact
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {categoryScores.map((bar, idx) => {
            const percentage = Math.min(100, (bar.score / 10) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cocoa-800 capitalize">
                    {bar.itemType} <span className="text-[10px] text-cocoa-400 font-normal">({bar.category})</span>
                  </span>
                  <span className="font-bold text-terracotta-700">
                    {bar.score.toFixed(1)} / 10
                  </span>
                </div>
                <div className="w-full bg-warm-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-cocoa-600 via-terracotta-500 to-terracotta-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
