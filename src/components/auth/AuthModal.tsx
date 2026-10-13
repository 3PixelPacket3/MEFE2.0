import React, { useState } from 'react';
import { X, LogIn, UserPlus, Users, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { UserProfile } from '../../types';
import { authService } from '../../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChange: (user: UserProfile) => void;
  currentUser: UserProfile | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserChange,
  currentUser
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'switch'>('switch');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const demoUsers = authService.getAllUsers();

  const handleSwitch = (uid: string) => {
    const user = authService.switchUser(uid);
    if (user) {
      onUserChange(user);
      onClose();
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const user = authService.loginWithEmail(email);
    onUserChange(user);
    onClose();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !displayName.trim()) return;
    const user = authService.register(displayName, email);
    onUserChange(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-border">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-warm-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold">
              M
            </div>
            <div>
              <h2 className="font-bold text-base text-cocoa-900">
                {mode === 'switch' ? 'Select or Switch Account' : mode === 'signin' ? 'Sign In to MEFE' : 'Create New Account'}
              </h2>
              <p className="text-xs text-cocoa-400">
                {currentUser ? `Currently signed in as ${currentUser.displayName}` : 'Mindful Fashion & Well-being'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-warm-100 text-cocoa-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-warm-100 rounded-2xl my-4 text-xs font-bold">
          <button
            onClick={() => setMode('switch')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'switch' ? 'bg-white text-cocoa-900 shadow-sm' : 'text-cocoa-600 hover:text-cocoa-900'
            }`}
          >
            Switch Profile
          </button>
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'signin' ? 'bg-white text-cocoa-900 shadow-sm' : 'text-cocoa-600 hover:text-cocoa-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'signup' ? 'bg-white text-cocoa-900 shadow-sm' : 'text-cocoa-600 hover:text-cocoa-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Mode: Quick Demo User Switcher */}
        {mode === 'switch' && (
          <div className="space-y-2.5 pt-1">
            <p className="text-xs font-semibold text-cocoa-500 mb-2">
              Select an account to instantly access isolated wardrobe, outfits & mood logs:
            </p>
            {demoUsers.map((u) => {
              const isSelected = currentUser?.uid === u.uid;
              return (
                <div
                  key={u.uid}
                  onClick={() => handleSwitch(u.uid)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-terracotta-50/70 border-terracotta-500 ring-2 ring-terracotta-500/20 shadow-sm'
                      : 'bg-warm-50 hover:bg-warm-100 border-warm-border'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.photoURL}
                      alt={u.displayName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-terracotta-400/40"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-cocoa-900 truncate">
                          {u.displayName}
                        </h4>
                        {u.role === 'admin' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-terracotta-100 text-terracotta-800">
                            Admin
                          </span>
                        )}
                        {u.isPremium && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-cocoa-400 truncate">{u.email}</p>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="text-[11px] font-bold text-terracotta-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Active
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-cocoa-500 hover:text-terracotta-600">
                      Switch →
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Mode: Sign In */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mefe.app"
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta transition-all"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Mode: Sign Up */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                Full Name / Handle
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Camille Lauren"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-warm-border bg-warm-50 text-cocoa-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mefe.app"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-warm-border bg-warm-50 text-cocoa-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-warm-border bg-warm-50 text-cocoa-900 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta transition-all"
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
