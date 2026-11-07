import React from 'react';
import {
  Home,
  Sparkles,
  Layers,
  BookHeart,
  BarChart3,
  UserCheck,
  ShoppingBag,
  Shield,
  Settings,
  LogOut
} from 'lucide-react';
import { ActiveTab, MenuSubView, UserProfile } from '../../types';

interface DesktopSidebarProps {
  activeTab: ActiveTab;
  menuSubView: MenuSubView;
  user: UserProfile | null;
  onTabChange: (tab: ActiveTab, subView?: MenuSubView) => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  menuSubView,
  user,
  onTabChange,
  onOpenSettings,
  onOpenAuth,
  onSignOut
}) => {
  const mainNavItems = [
    { id: 'social' as ActiveTab, label: 'Social Feed', icon: Home },
    { id: 'closet' as ActiveTab, label: 'My Closet', icon: Sparkles },
    { id: 'outfits' as ActiveTab, label: 'Outfits & Calendar', icon: Layers },
    { id: 'journal' as ActiveTab, label: 'Mood Journal', icon: BookHeart },
  ];

  const subNavItems = [
    { id: 'insights' as MenuSubView, label: 'Wardrobe Analytics', icon: BarChart3, badge: 'Stats' },
    { id: 'avatar' as MenuSubView, label: '3D Avatar Studio', icon: UserCheck, badge: 'Three.js' },
    { id: 'retailers' as MenuSubView, label: 'Shop the Look', icon: ShoppingBag },
    ...(user && user.role === 'admin'
      ? [{ id: 'admin' as MenuSubView, label: 'Admin Dashboard', icon: Shield, badge: 'Admin' }]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-white/80 backdrop-blur-md border-r border-warm-border p-4 justify-between select-none">
      <div className="space-y-6">
        {/* Official MEFE Golden Hanger Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-amber-300/60 shadow-warm-sm bg-[#FAF5EB] flex items-center justify-center shrink-0">
            <img
              src="./mefe-logo.jpg"
              alt="MEFE Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-cocoa-900 tracking-tight leading-none">
              MEFE
            </h1>
            <p className="text-[11px] font-medium text-terracotta-600 tracking-wide uppercase mt-0.5">
              Wardrobe & Mood Studio
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

        {/* 3D Studio & Analytics Navigation */}
        <div className="space-y-1 pt-2 border-t border-warm-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400 px-3 py-1">
            3D Studio & Analytics
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

      {/* User Profile Card & Sign Out Controls (No Account Switching) */}
      {user ? (
        <div className="p-3 bg-warm-50 rounded-2xl border border-warm-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-terracotta-400/40"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-cocoa-900 truncate">{user.displayName}</p>
                <p className="text-[10px] text-cocoa-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              title="Settings"
              className="p-1.5 text-cocoa-400 hover:text-cocoa-700 hover:bg-warm-200 rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Account Actions: Sign Out Only */}
          <div className="pt-1 border-t border-warm-border">
            <button
              onClick={onSignOut}
              className="w-full py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onOpenAuth}
          className="w-full py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta transition-all"
        >
          Log In / Sign Up
        </button>
      )}
    </aside>
  );
};
