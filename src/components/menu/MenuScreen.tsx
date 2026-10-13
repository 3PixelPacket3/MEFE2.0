import React from 'react';
import {
  BarChart3,
  UserCheck,
  ShoppingBag,
  Shield,
  Settings,
  ChevronRight,
  LogOut,
  Users
} from 'lucide-react';
import { UserProfile, MenuSubView } from '../../types';
import { useTranslation } from '../../i18n';

interface MenuScreenProps {
  user: UserProfile | null;
  onSelectSubView: (subView: MenuSubView) => void;
  onOpenSettings: () => void;
  onOpenRetailers: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  user,
  onSelectSubView,
  onOpenSettings,
  onOpenRetailers,
  onOpenAuth,
  onSignOut
}) => {
  const { t } = useTranslation();

  const menuItems = [
    {
      id: 'insights' as MenuSubView,
      title: 'Wardrobe Analytics',
      desc: 'Statistical correlations between moods and outfits worn',
      icon: BarChart3,
      color: 'bg-amber-100 text-amber-700',
      badge: 'Data Engine',
      action: () => onSelectSubView('insights')
    },
    {
      id: 'avatar' as MenuSubView,
      title: '3D Avatar Studio',
      desc: 'Real-time Three.js 360° mannequin & garment projection',
      icon: UserCheck,
      color: 'bg-terracotta-100 text-terracotta-700',
      badge: 'Three.js 3D',
      action: () => onSelectSubView('avatar')
    },
    {
      id: 'retailers' as MenuSubView,
      title: 'Shop the Look',
      desc: 'Curated affiliate stores: ASOS, Nordstrom, Zara, Reformation',
      icon: ShoppingBag,
      color: 'bg-rose-100 text-rose-700',
      action: onOpenRetailers
    },
    ...(user && user.role === 'admin'
      ? [
          {
            id: 'admin' as MenuSubView,
            title: 'Admin Dashboard',
            desc: 'User moderation, retailer catalogs & single-line embed builder',
            icon: Shield,
            color: 'bg-cocoa-100 text-cocoa-700',
            badge: 'Admin Only',
            action: () => onSelectSubView('admin')
          }
        ]
      : []),
    {
      id: 'settings' as MenuSubView,
      title: 'Settings & Language',
      desc: 'Switch between English, French, and Spanish',
      icon: Settings,
      color: 'bg-warm-200 text-cocoa-700',
      action: onOpenSettings
    }
  ];

  return (
    <div className="pb-24 pt-2 space-y-5">
      {/* User Profile Mini Banner with Switch / Sign Out actions */}
      {user ? (
        <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-warm-sm space-y-3">
          <div className="flex items-center gap-4">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-14 h-14 rounded-full object-cover ring-4 ring-terracotta-400/40"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-cocoa-900 truncate">
                  {user.displayName}
                </h2>
                {user.isPremium && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-cocoa-500 line-clamp-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-cocoa-400 font-semibold">
                <span>{user.followersCount} followers</span>
                <span>•</span>
                <span>{user.followingCount} following</span>
              </div>
            </div>
          </div>

          {/* Account Controls */}
          <div className="flex items-center gap-2 pt-2 border-t border-warm-100">
            <button
              onClick={onOpenAuth}
              className="flex-1 py-2 px-3 rounded-2xl bg-warm-100 hover:bg-warm-200 text-cocoa-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4 text-terracotta-600" />
              <span>Switch User</span>
            </button>
            <button
              onClick={onSignOut}
              className="py-2 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-warm-sm text-center space-y-2">
          <p className="text-sm font-semibold text-cocoa-700">You are currently in guest mode</p>
          <button
            onClick={onOpenAuth}
            className="w-full py-3 rounded-2xl bg-terracotta-500 text-white font-bold text-xs shadow-terracotta"
          >
            Sign In / Switch Profile
          </button>
        </div>
      )}

      {/* Menu Options List */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-cocoa-400 px-1">
          Studios & Management
        </h3>

        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="w-full bg-white rounded-2xl p-4 border border-warm-border hover:border-terracotta-300 shadow-warm-sm hover:shadow-warm-md flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-cocoa-900 group-hover:text-terracotta-600 transition-colors">
                      {item.title}
                    </h4>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warm-100 text-cocoa-600">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cocoa-400 mt-0.5 line-clamp-1">{item.desc}</p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-cocoa-300 group-hover:text-terracotta-500 group-hover:translate-x-1 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
