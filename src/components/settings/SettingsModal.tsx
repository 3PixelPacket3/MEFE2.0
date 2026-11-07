import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Globe,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useTranslation, Language } from '../../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSignOut
}) => {
  const { language, setLanguage, t } = useTranslation();

  // Profile
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isAdminRole, setIsAdminRole] = useState(user?.role === 'admin');

  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      onUpdateUser({
        displayName: displayName.trim(),
        bio: bio.trim(),
        role: isAdminRole ? 'admin' : 'user'
      });
    }

    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-cocoa-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-warm-border max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-warm-border">
          <div className="flex items-center gap-2.5">
            <img
              src="./mefe-logo.jpg"
              alt="MEFE"
              className="w-8 h-8 rounded-lg object-cover border border-warm-border"
            />
            <h2 className="font-bold text-lg text-cocoa-900">{t('settingsTitle')}</h2>
            {savedNotification && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-warm-100 text-cocoa-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveAll} className="space-y-5 pt-4">
          {/* User Account Bar with Sign Out */}
          {user && (
            <div className="p-3.5 bg-warm-50 rounded-2xl border border-warm-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-terracotta-400"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-cocoa-900">{user.displayName}</h4>
                  <p className="text-[11px] text-cocoa-400">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* User Profile Fields */}
          {user && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cocoa-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-terracotta-500" />
                <span>{t('userProfile')}</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-cocoa-600 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-warm-border bg-warm-50 focus:bg-white text-cocoa-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cocoa-600 mb-1">
                  Bio
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-warm-border bg-warm-50 focus:bg-white text-cocoa-900"
                />
              </div>
            </div>
          )}

          {/* Language Selection */}
          <div className="space-y-2 pt-2 border-t border-warm-100">
            <h3 className="text-xs font-bold text-cocoa-800 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-terracotta-500" />
              <span>{t('languageSelect')}</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'fr', label: 'Français' },
                { code: 'es', label: 'Español' },
              ].map(lang => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    language === lang.code
                      ? 'bg-terracotta-500 text-white border-terracotta-500 shadow-terracotta'
                      : 'bg-warm-50 text-cocoa-700 border-warm-border hover:bg-warm-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Automatic Save Status Indicator */}
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-900 block">
                Automatic Data Persistence Active
              </span>
              <span className="text-[11px] text-emerald-700">
                Your closet items, 3D avatar settings, outfits, and mood journals are saved automatically to your account.
              </span>
            </div>
          </div>

          {/* Role Toggle for Admin Preview */}
          {user && (
            <div className="p-3 bg-warm-50 rounded-2xl border border-warm-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-terracotta-600" />
                <div>
                  <span className="text-xs font-bold text-cocoa-900 block">
                    {t('demoModeToggle')}
                  </span>
                  <span className="text-[10px] text-cocoa-400">
                    Enable or hide Executive Admin Dashboard access
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminRole(!isAdminRole)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isAdminRole
                    ? 'bg-terracotta-500 text-white shadow-sm'
                    : 'bg-warm-200 text-cocoa-600'
                }`}
              >
                {isAdminRole ? 'Admin Active' : 'User Active'}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-warm-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-warm-100 font-bold text-xs text-cocoa-700"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta"
            >
              {t('saveSettings')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
