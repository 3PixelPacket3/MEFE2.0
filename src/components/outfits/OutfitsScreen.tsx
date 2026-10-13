import React, { useState } from 'react';
import { Layers, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { ClosetItem, Outfit, UserProfile } from '../../types';
import { useTranslation } from '../../i18n';
import { OutfitBuilder } from './OutfitBuilder';
import { OutfitCalendar } from './OutfitCalendar';
import { ThreeAvatarStudio } from '../avatar/ThreeAvatarStudio';

interface OutfitsScreenProps {
  closetItems: ClosetItem[];
  outfits: Outfit[];
  user: UserProfile;
  onSaveOutfit: (outfit: Omit<Outfit, 'outfitId' | 'createdAt' | 'updatedAt'>) => void;
  onScheduleOutfit: (outfitId: string, date: string) => void;
  initialShowAvatar?: boolean;
}

export const OutfitsScreen: React.FC<OutfitsScreenProps> = ({
  closetItems,
  outfits,
  user,
  onSaveOutfit,
  onScheduleOutfit,
  initialShowAvatar = false
}) => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'builder' | 'calendar'>('builder');
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(initialShowAvatar);

  return (
    <div className="pb-24 pt-2 relative">
      {/* Screen Title & Top Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-cocoa-900 tracking-tight">
            {t('outfitsTitle')}
          </h1>
          <p className="text-xs text-cocoa-400 mt-0.5">
            {outfits.length} styled ensembles in your lookbook
          </p>
        </div>

        {/* Tab Toggle: [Builder] | [Calendar] */}
        <div className="flex items-center p-1 bg-white rounded-2xl border border-warm-border shadow-warm-sm self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'builder'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-cocoa-600 hover:text-cocoa-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('tabBuilder')}</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'calendar'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-cocoa-600 hover:text-cocoa-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{t('tabCalendar')}</span>
          </button>
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === 'builder' ? (
        <OutfitBuilder
          closetItems={closetItems}
          onSaveOutfit={onSaveOutfit}
          onLaunchAvatar={() => setIsAvatarStudioOpen(true)}
        />
      ) : (
        <OutfitCalendar
          outfits={outfits}
          onScheduleOutfit={onScheduleOutfit}
        />
      )}

      {/* Floating Action Button (FAB): 3D Avatar Studio */}
      <button
        onClick={() => setIsAvatarStudioOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-terracotta-500 to-terracotta-700 text-white font-bold text-xs sm:text-sm shadow-warm-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/80 group"
      >
        <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
        <span>3D Avatar Studio</span>
      </button>

      {/* Three.js 3D Avatar Studio Viewport */}
      {isAvatarStudioOpen && (
        <ThreeAvatarStudio
          closetItems={closetItems}
          user={user}
          onSaveOutfit={onSaveOutfit}
          onClose={() => setIsAvatarStudioOpen(false)}
        />
      )}
    </div>
  );
};
