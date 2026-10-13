import React from 'react';
import {
  BrainCircuit,
  UserCheck,
  ShoppingBag,
  Shield,
  Settings,
  ChevronRight,
  Sparkles,
  Heart,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { UserProfile, MenuSubView } from '../../types';
import { useTranslation } from '../../i18n';

interface MenuScreenProps {
  user: UserProfile;
  onSelectSubView: (subView: MenuSubView) => void;
  onOpenSettings: () => void;
  onOpenRetailers: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  user,
  onSelectSubView,
  onOpenSettings,
  onOpenRetailers
}) => {
  const { t } = useTranslation();

  const menuItems = [
    {
      id: 'insights' as MenuSubView,
      title: t('navInsights'),
      desc: 'Pattern recognition between mood and fashion choices',
      icon: BrainCircuit,
      color: 'bg-amber-100 text-amber-700',
      badge: 'AI Brain',
      action: () => onSelectSubView('insights')
    },
    {
      id: 'avatar' as MenuSubView,
      title: t('navAvatar'),
      desc: '2D layered fitting room & Cher Horowitz Web Speech voice',
      icon: UserCheck,
      color: 'bg-terracotta-100 text-terracotta-700',
      badge: '90s Clueless',
      action: () => onSelectSubView('avatar')
    },
    {
      id: 'retailers' as MenuSubView,
      title: t('navRetailers'),
      desc: 'Curated affiliate stores: ASOS, Nordstrom, Zara, Reformation',
      icon: ShoppingBag,
      color: 'bg-rose-100 text-rose-700',
      action: onOpenRetailers
    },
    ...(user.role === 'admin'
      ? [
          {
            id: 'admin' as MenuSubView,
            title: t('navAdmin'),
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
      title: t('navSettings'),
      desc: 'Language switch, Gemini API key & Cloud sync',
      icon: Settings,
      color: 'bg-warm-200 text-cocoa-700',
      action: onOpenSettings
    }
  ];

  return (
    <div className="pb-24 pt-2 space-y-5">
      {/* User Profile Mini Banner */}
      <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-warm-sm flex items-center gap-4">
        <img
          src={user.photoURL}
          alt={user.displayName}
          className="w-16 h-16 rounded-full object-cover ring-4 ring-terracotta-400/40"
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
          <p className="text-xs text-cocoa-500 line-clamp-1">{user.bio}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-cocoa-400 font-semibold">
            <span>{user.followersCount} followers</span>
            <span>•</span>
            <span>{user.followingCount} following</span>
          </div>
        </div>
      </div>

      {/* Menu Options List */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-cocoa-400 px-1">
          Special Studios & Controls
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
