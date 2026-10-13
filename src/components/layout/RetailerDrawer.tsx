import React, { useState, useEffect } from 'react';
import { X, Search, ExternalLink, ShoppingBag, Sparkles } from 'lucide-react';
import { Retailer } from '../../types';
import { dbService } from '../../services/storage';
import { useTranslation } from '../../i18n';

interface RetailerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const RetailerDrawer: React.FC<RetailerDrawerProps> = ({
  isOpen,
  onClose,
  initialQuery = 'terracotta blazer'
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [retailers, setRetailers] = useState<Retailer[]>([]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (isOpen) {
      const all = dbService.getRetailers()
        .filter(r => r.isActive)
        .sort((a, b) => a.priorityOrder - b.priorityOrder);
      setRetailers(all);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const buildSearchUrl = (template: string, affiliateId: string, q: string) => {
    return template
      .replace('{query}', encodeURIComponent(q.trim()))
      .replace('{affiliateId}', encodeURIComponent(affiliateId));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-cocoa-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-warm-border bg-warm-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-terracotta-100 flex items-center justify-center text-terracotta-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-cocoa-900">{t('shopTheLookTitle')}</h3>
              <p className="text-xs text-cocoa-400">{t('shopTheLookSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-warm-200 text-cocoa-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input for query */}
        <div className="p-4 border-b border-warm-border">
          <label className="block text-xs font-bold text-cocoa-600 mb-1.5 uppercase tracking-wider">
            Search Item or Look
          </label>
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-cocoa-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchAffiliates')}
              className="w-full pl-9 pr-3 py-2 text-sm bg-warm-50 rounded-xl border border-warm-border focus:outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 text-cocoa-900"
            />
          </div>
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
            {['terracotta blazer', 'amber silk slip', 'cocoa knit', 'wide leg trousers', 'gold hoops'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                  query.toLowerCase() === tag.toLowerCase()
                    ? 'bg-terracotta-500 text-white font-medium'
                    : 'bg-warm-100 text-cocoa-600 hover:bg-warm-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Curated Retailers List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-cocoa-500 mb-1">
            <span>{t('partnerRetailers')} ({retailers.length})</span>
            <span className="flex items-center gap-1 text-terracotta-600 text-[11px]">
              <Sparkles className="w-3 h-3" /> Direct Affiliate Links
            </span>
          </div>

          {retailers.map((retailer) => {
            const destinationUrl = buildSearchUrl(retailer.searchUrlTemplate, retailer.affiliateId, query);
            return (
              <div
                key={retailer.retailerId}
                className="p-3.5 rounded-2xl border border-warm-border hover:border-terracotta-300 bg-white hover:shadow-warm-md transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={retailer.logoUrl}
                    alt={retailer.name}
                    className="w-12 h-12 rounded-xl object-cover border border-warm-border group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-cocoa-900 group-hover:text-terracotta-600 transition-colors">
                      {retailer.name}
                    </h4>
                    <p className="text-[11px] text-cocoa-400">
                      Live catalog for "{query}"
                    </p>
                  </div>
                </div>

                <a
                  href={destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-terracotta-50 hover:bg-terracotta-500 text-terracotta-600 hover:text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm"
                >
                  <span>{t('visitStore')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
