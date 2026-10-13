import React from 'react';
import { Home, Sparkles, Layers, BookHeart, Menu } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useTranslation } from '../../i18n';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'social', label: t('navSocial'), icon: Home },
    { id: 'closet', label: t('navCloset'), icon: Sparkles },
    { id: 'outfits', label: t('navOutfits'), icon: Layers },
    { id: 'journal', label: t('navJournal'), icon: BookHeart },
    { id: 'menu', label: t('navMenu'), icon: Menu },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-warm-border pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(60,47,47,0.06)]">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center relative py-1 focus:outline-none transition-all duration-200 group"
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-terracotta-500 rounded-b-full shadow-terracotta" />
              )}
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-terracotta-500 scale-110'
                    : 'text-cocoa-400 group-hover:text-cocoa-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-terracotta-600 font-bold' : 'text-cocoa-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
