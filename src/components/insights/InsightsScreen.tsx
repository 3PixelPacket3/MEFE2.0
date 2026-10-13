import React, { useState } from 'react';
import {
  TrendingUp,
  Zap,
  Award,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Calendar,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { WardrobeAnalytics, JournalEntry, ClosetItem, Outfit } from '../../types';
import { useTranslation } from '../../i18n';
import { calculateWardrobeAnalytics } from '../../services/analytics';

interface InsightsScreenProps {
  journals: JournalEntry[];
  closetItems: ClosetItem[];
  outfits: Outfit[];
  onOpenOutfits: () => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  journals,
  closetItems,
  outfits,
  onOpenOutfits
}) => {
  const { t } = useTranslation();

  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('all_time');

  // Compute live deterministic statistical analytics
  const analytics: WardrobeAnalytics = calculateWardrobeAnalytics(journals, closetItems, outfits, period);

  const topOutfit = outfits.find(o => o.outfitId === analytics.topOutfitId) || outfits[0];

  // Category correlation bars
  const categoryScores: { category: string; itemType: string; score: number }[] = [];
  if (analytics.categoryCorrelations) {
    Object.entries(analytics.categoryCorrelations).forEach(([cat, subMap]) => {
      Object.entries(subMap).forEach(([itemType, score]) => {
        categoryScores.push({ category: cat, itemType, score });
      });
    });
  }

  return (
    <div className="pb-24 pt-2 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-100 text-terracotta-800 uppercase tracking-wider flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Wardrobe Analytics
            </span>
            <span className="text-xs text-cocoa-400">Statistical Correlation Engine</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-cocoa-900 tracking-tight mt-1">
            Wardrobe & Mood Analytics
          </h1>
          <p className="text-xs text-cocoa-400">
            Real data patterns between what you wear and how you feel
          </p>
        </div>

        {/* Period Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-warm-border shadow-warm-sm self-start sm:self-auto">
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
              {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Metric Banner: Power Color & Top Mood Ensemble */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Power Color Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-terracotta-800 p-6 text-white shadow-terracotta">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3 text-amber-200">
            <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Statistical Power Color
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            {analytics.powerColor}
          </h2>
          <p className="text-xs text-white/90 mt-2 leading-relaxed">
            Statistically correlated with highest emotional mood scores across your logged reflections.
          </p>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-white/80">
            <span>Logged Check-ins: {analytics.totalCheckins}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] text-white">
              {analytics.avgMoodScore}/10 Mean Score
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
                  Top Mood-Boosting Ensemble
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

      {/* Analytical Summary Block */}
      <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-warm-sm space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-warm-100">
          <div className="w-8 h-8 rounded-xl bg-terracotta-100 flex items-center justify-center text-terracotta-600">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-cocoa-900">
              Wardrobe Correlation Diagnosis
            </h3>
            <p className="text-[11px] text-cocoa-400">
              Computed from daily check-ins and worn pieces
            </p>
          </div>
        </div>

        <div className="p-4 bg-warm-50 rounded-2xl border border-warm-border">
          <p className="text-xs sm:text-sm text-cocoa-800 leading-relaxed font-normal">
            {analytics.narrativeSummary}
          </p>
        </div>

        {/* Actionable Style Tip */}
        <div className="p-4 bg-terracotta-50/70 rounded-2xl border border-terracotta-200/70 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-terracotta-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-800 block mb-0.5">
              Empowerment Style Recommendation
            </span>
            <p className="text-xs text-cocoa-800 leading-relaxed font-medium">
              {analytics.actionableTip}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Data: Bar Chart correlating Mood Scores (Y-axis) with Clothing Categories (X-axis) */}
      <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-warm-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-warm-100">
          <div>
            <h3 className="font-bold text-sm text-cocoa-900">
              Mood Score vs Clothing Category
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
