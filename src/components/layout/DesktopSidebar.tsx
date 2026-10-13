import React from 'react';
import {
  Home,
  Sparkles,
  Layers,
  BookHeart,
  BrainCircuit,
  UserCheck,
  ShoppingBag,
  Shield,
  Settings
} from 'lucide-react';
import { ActiveTab, MenuSubView, UserProfile } from '../../types';
import { useTranslation } from '../../i18n';

interface DesktopSidebarProps {
  activeTab: ActiveTab;
  menuSubView: MenuSubView;
  user: UserProfile;
  onTabChange: (tab: ActiveTab, subView?: MenuSubView) => void;
  onOpenSettings: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  menuSubView,
  user,
  onTabChange,
  onOpenSettings,
}) => {
  const { t } = useTranslation();

  const mainNavItems = [
    { id: 'social' as ActiveTab, label: t('navSocial'), icon: Home },
    { id: 'closet' as ActiveTab, label: t('navCloset'), icon: Sparkles },
    { id: 'outfits' as ActiveTab, label: t('navOutfits'), icon: Layers },
    { id: 'journal' as ActiveTab, label: t('navJournal'), icon: BookHeart },
  ];

  const subNavItems = [
    { id: 'insights' as MenuSubView, label: t('navInsights'), icon: BrainCircuit, badge: 'AI' },
    { id: 'avatar' as MenuSubView, label: t('navAvatar'), icon: UserCheck, badge: '90s' },
    { id: 'retailers' as MenuSubView, label: t('navRetailers'), icon: ShoppingBag },
    ...(user.role === 'admin'
      ? [{ id: 'admin' as MenuSubView, label: t('navAdmin'), icon: Shield, badge: 'Admin' }]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-white/80 backdrop-blur-md border-r border-warm-border p-4 justify-between select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 flex items-center justify-center text-white shadow-terracotta font-bold text-lg">
            M
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-cocoa-900 tracking-tight leading-none">
              MEFE
            </h1>
            <p className="text-[11px] font-medium text-terracotta-600 tracking-wide uppercase mt-0.5">
              Wardrobe & Mood AI
            </p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400 px-3 py-1">
            Studio Navigation
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !menuSubView;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id, null)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-terracotta-500 text-white shadow-terracotta translate-x-1'
                    : 'text-cocoa-600 hover:bg-warm-100 hover:text-cocoa-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cocoa-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Special AI & Studio Features */}
        <div className="space-y-1 pt-2 border-t border-warm-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400 px-3 py-1">
            AI Brain & Studios
          </p>
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === 'menu' && menuSubView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange('menu', item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-cocoa-600 text-white shadow-warm-md translate-x-1'
                    : 'text-cocoa-600 hover:bg-warm-100 hover:text-cocoa-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cocoa-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-warm-200 text-cocoa-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile Footer Card */}
      <div className="p-3 bg-warm-50 rounded-2xl border border-warm-border flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-terracotta-400/40"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-cocoa-900 truncate">{user.displayName}</p>
            <p className="text-[11px] text-cocoa-400 truncate">
              {user.isPremium ? '★ Pro Member' : 'Free Tier'}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          title={t('navSettings')}
          className="p-1.5 text-cocoa-400 hover:text-cocoa-700 hover:bg-warm-200 rounded-xl transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
