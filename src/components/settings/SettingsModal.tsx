import React, { useState } from 'react';
import {
  X,
  Key,
  Database,
  User,
  Shield,
  Sparkles,
  Globe,
  Save,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useTranslation, Language } from '../../i18n';
import { getGeminiApiKey, saveGeminiApiKey, getGeminiModelName, saveGeminiModelName } from '../../services/gemini';
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  FirebaseConfig
} from '../../services/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) => {
  const { language, setLanguage, t } = useTranslation();

  // Profile
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [isAdminRole, setIsAdminRole] = useState(user.role === 'admin');

  // Gemini API Key
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());
  const [geminiModel, setGeminiModel] = useState(getGeminiModelName());

  // Firebase Config
  const storedFb = getStoredFirebaseConfig();
  const [fbApiKey, setFbApiKey] = useState(storedFb?.apiKey || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(storedFb?.authDomain || '');
  const [fbProjectId, setFbProjectId] = useState(storedFb?.projectId || '');
  const [fbStorageBucket, setFbStorageBucket] = useState(storedFb?.storageBucket || '');
  const [fbAppId, setFbAppId] = useState(storedFb?.appId || '');

  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    // Update user profile
    onUpdateUser({
      displayName: displayName.trim(),
      bio: bio.trim(),
      role: isAdminRole ? 'admin' : 'user'
    });

    // Save Gemini keys
    saveGeminiApiKey(geminiKey);
    saveGeminiModelName(geminiModel);

    // Save Firebase keys if provided
    if (fbApiKey && fbProjectId) {
      saveFirebaseConfig({
        apiKey: fbApiKey.trim(),
        authDomain: fbAuthDomain.trim(),
        projectId: fbProjectId.trim(),
        storageBucket: fbStorageBucket.trim(),
        messagingSenderId: '',
        appId: fbAppId.trim()
      });
    }

    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-cocoa-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-warm-border max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-warm-border">
          <div className="flex items-center gap-2">
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
          {/* User Profile */}
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

          {/* Google AI Studio Gemini API Configuration */}
          <div className="space-y-2.5 pt-2 border-t border-warm-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cocoa-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Google AI Studio (Gemini Brain)</span>
              </h3>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-terracotta-600 hover:underline flex items-center gap-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cocoa-600 mb-1">
                {t('geminiApiKeyLabel')}
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-warm-border bg-warm-50 focus:bg-white text-cocoa-900"
              />
              <p className="text-[11px] text-cocoa-400 mt-1">
                {t('apiKeyHint')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cocoa-600 mb-1">
                Gemini Model / Tuned Model ID
              </label>
              <input
                type="text"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                placeholder="gemini-1.5-flash or custom tuned model ID"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-warm-border bg-warm-50 focus:bg-white text-cocoa-900"
              />
            </div>
          </div>

          {/* Firebase Credentials Configuration */}
          <div className="space-y-2.5 pt-2 border-t border-warm-100">
            <h3 className="text-xs font-bold text-cocoa-800 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-terracotta-500" />
              <span>{t('firebaseConfig')}</span>
            </h3>
            <p className="text-[11px] text-cocoa-400">
              MEFE runs completely offline/client-side out-of-the-box. Add Firebase credentials below if syncing to Google Cloud Firestore.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-cocoa-600 mb-0.5">API Key</label>
                <input
                  type="text"
                  value={fbApiKey}
                  onChange={(e) => setFbApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-warm-border bg-warm-50 text-cocoa-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-cocoa-600 mb-0.5">Project ID</label>
                <input
                  type="text"
                  value={fbProjectId}
                  onChange={(e) => setFbProjectId(e.target.value)}
                  placeholder="mefe-wardrobe"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-warm-border bg-warm-50 text-cocoa-900"
                />
              </div>
            </div>
          </div>

          {/* Role Switching for Testing */}
          <div className="p-3 bg-warm-50 rounded-2xl border border-warm-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-terracotta-600" />
              <div>
                <span className="text-xs font-bold text-cocoa-900 block">
                  {t('demoModeToggle')}
                </span>
                <span className="text-[10px] text-cocoa-400">
                  Switch between standard User and Executive Admin views
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
