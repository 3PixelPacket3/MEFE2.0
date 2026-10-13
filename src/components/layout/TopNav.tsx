import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Sparkles, Download, Settings, X, Wifi, WifiOff } from 'lucide-react';
import { useTranslation, Language } from '../../i18n';
import { UserProfile, ClosetItem, Post } from '../../types';
import { dbService } from '../../services/storage';

interface TopNavProps {
  user: UserProfile;
  onOpenSettings: () => void;
  onSelectItem: (item: ClosetItem) => void;
  onOpenRetailers: (query?: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  onOpenSettings,
  onSelectItem,
  onOpenRetailers
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ closet: ClosetItem[]; posts: Post[] }>({
    closet: [],
    posts: []
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      setSearchResults(dbService.searchAll(val));
    } else {
      setSearchResults({ closet: [], posts: [] });
    }
  };

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => {
        setInstallPrompt(null);
      });
    } else {
      alert("To install MEFE on your device:\n\n• On Chrome/Android: Tap menu (⋮) -> 'Install App'\n• On Safari/iOS: Tap Share (⎋) -> 'Add to Home Screen'");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-warm-50/95 backdrop-blur-md border-b border-warm-border px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand for mobile when sidebar is hidden */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold shadow-terracotta text-sm">
            M
          </div>
          <span className="font-display font-bold text-lg text-cocoa-900 tracking-tight">MEFE</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-cocoa-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-warm-100/80 hover:bg-warm-100 focus:bg-white text-cocoa-900 placeholder:text-cocoa-400 rounded-full border border-warm-200 focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 p-1 text-cocoa-400 hover:text-cocoa-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchFocused && searchQuery.trim() && (
            <div
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-warm-lg border border-warm-border overflow-hidden z-50 max-h-96 overflow-y-auto"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="p-3 bg-warm-50 border-b border-warm-border flex justify-between items-center text-xs font-semibold text-cocoa-600">
                <span>Search Results for "{searchQuery}"</span>
                <button
                  onClick={() => {
                    setIsSearchFocused(false);
                    onOpenRetailers(searchQuery);
                  }}
                  className="text-terracotta-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Shop retailers for this
                </button>
              </div>

              {/* Wardrobe matches */}
              <div className="p-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400 px-2 py-1">
                  Wardrobe Items ({searchResults.closet.length})
                </p>
                {searchResults.closet.length > 0 ? (
                  searchResults.closet.slice(0, 5).map((item) => (
                    <div
                      key={item.itemId}
                      onClick={() => {
                        setIsSearchFocused(false);
                        onSelectItem(item);
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-warm-50 rounded-xl cursor-pointer transition-colors"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-warm-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-cocoa-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-cocoa-400 capitalize">
                          {item.category} • {item.emotionalTags.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-cocoa-400 px-2 py-1">No closet matches found.</p>
                )}
              </div>

              {/* Social matches */}
              {searchResults.posts.length > 0 && (
                <div className="p-2 border-t border-warm-border">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400 px-2 py-1">
                    Community Posts ({searchResults.posts.length})
                  </p>
                  {searchResults.posts.slice(0, 3).map((post) => (
                    <div
                      key={post.postId}
                      className="flex items-center gap-3 p-2 hover:bg-warm-50 rounded-xl cursor-pointer transition-colors"
                    >
                      <img
                        src={post.mediaUrl}
                        alt="Post look"
                        className="w-10 h-10 rounded-lg object-cover border border-warm-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-cocoa-800 line-clamp-1">{post.caption}</p>
                        <p className="text-[11px] text-cocoa-400">By {post.authorDisplayName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls: Language, PWA Install, Admin Badge, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* PWA Install Button */}
          <button
            onClick={handleInstallClick}
            title={t('installPwa')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cocoa-700 bg-warm-100 hover:bg-warm-200 rounded-full border border-warm-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-terracotta-500" />
            <span className="hidden sm:inline">{t('installPwa')}</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 text-cocoa-500 absolute left-2 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="pl-6 pr-2 py-1 text-xs font-semibold bg-warm-100 hover:bg-warm-200 text-cocoa-800 rounded-full border border-warm-200 focus:outline-none cursor-pointer appearance-none uppercase"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
            </select>
          </div>

          {/* Role & Status Badges */}
          {user.role === 'admin' && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-terracotta-700 bg-terracotta-100 rounded-full border border-terracotta-300">
              <Shield className="w-3 h-3" />
              {t('adminBadge')}
            </span>
          )}

          {user.isPremium && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-amber-800 bg-amber-100 rounded-full border border-amber-300">
              <Sparkles className="w-3 h-3" />
              {t('premiumBadge')}
            </span>
          )}

          {/* Online / Offline status */}
          <span
            title={isOnline ? t('cloudConnected') : t('offlineMode')}
            className="p-1.5 rounded-full text-cocoa-500"
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            )}
          </span>

          {/* Settings / Profile Button */}
          <button
            onClick={onOpenSettings}
            title={t('navSettings')}
            className="p-1.5 rounded-full bg-warm-100 hover:bg-warm-200 text-cocoa-700 border border-warm-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
