import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types';
import { authService } from '../../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onUserChange: (user: UserProfile) => void;
  isFullScreenGate?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserChange,
  isFullScreenGate = false
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Google Sign-In prompt state
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  if (!isOpen && !isFullScreenGate) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const user = authService.loginWithEmail(email, password);
      onUserChange(user);
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign in failed. Please check your credentials.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    try {
      const user = authService.register(displayName, email, password);
      onUserChange(user);
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  const handleGoogleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    try {
      const user = await authService.loginWithGoogle({
        email: googleEmail.trim() || 'camille@mefe.app',
        displayName: googleName.trim() || (googleEmail ? googleEmail.split('@')[0] : 'Camille Lauren'),
      });
      setShowGooglePrompt(false);
      onUserChange(user);
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    }
  };

  return (
    <div
      className={`${
        isFullScreenGate
          ? 'min-h-screen w-full bg-gradient-to-br from-[#F5E9DA] via-[#FAF6F0] to-[#EAD7C3] flex items-center justify-center p-4'
          : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/60 backdrop-blur-md animate-in fade-in duration-200'
      }`}
    >
      <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-warm-border relative overflow-hidden">
        {/* Decorative warm gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C89D54] via-[#E2725B] to-[#8A6224]" />

        {!isFullScreenGate && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-warm-100 text-cocoa-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Official New MEFE Golden Hanger Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-warm-md border border-[#E5D3B8] mb-3 bg-[#EAD9C3] flex items-center justify-center">
            <img
              src="./mefe-logo.jpg"
              alt="MEFE Official Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display font-bold text-2xl text-cocoa-900 tracking-tight">
            {mode === 'signin' ? 'Welcome Back to MEFE' : 'Join MEFE Studio'}
          </h1>
          <p className="text-xs text-cocoa-500 mt-1">
            Mindful Fashion, 3D Avatar Fitting & Emotional Well-Being
          </p>
        </div>

        {/* Google OAuth Sub-Prompt */}
        {showGooglePrompt ? (
          <form onSubmit={handleGoogleSignIn} className="space-y-4 bg-warm-50 p-5 rounded-2xl border border-warm-border animate-in fade-in">
            <div className="flex items-center gap-2.5 pb-2 border-b border-warm-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.99-2.19-6.97-5.14H1.02v3.14C3.03 21.14 7.21 24 12 24z" />
                <path fill="#FBBC05" d="M5.03 13.99c-.25-.72-.39-1.5-.39-2.3s.14-1.58.39-2.3V6.25H1.02C.37 7.55 0 9.01 0 11.69s.37 4.14 1.02 5.44l4.01-3.14z" />
                <path fill="#EA4335" d="M12 4.75c1.79 0 3.4.62 4.67 1.82l3.5-3.5C18.07 1.14 15.3 0 12 0 7.21 0 3.03 2.86 1.02 6.85l4.01 3.14c.98-2.95 3.73-5.24 6.97-5.24z" />
              </svg>
              <span className="font-bold text-xs text-cocoa-900">Sign in with Google</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-cocoa-700 uppercase mb-1">
                Your Google Email
              </label>
              <input
                type="email"
                required
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-white text-xs text-cocoa-900 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-cocoa-700 uppercase mb-1">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-white text-xs text-cocoa-900 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowGooglePrompt(false)}
                className="flex-1 py-2.5 rounded-xl bg-warm-200 text-cocoa-700 font-bold text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Prominent Google Sign-In Button */}
            <button
              type="button"
              onClick={() => setShowGooglePrompt(true)}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-warm-50 text-cocoa-800 font-bold text-xs sm:text-sm border border-warm-border shadow-warm-sm hover:shadow-warm-md flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.99-2.19-6.97-5.14H1.02v3.14C3.03 21.14 7.21 24 12 24z" />
                <path fill="#FBBC05" d="M5.03 13.99c-.25-.72-.39-1.5-.39-2.3s.14-1.58.39-2.3V6.25H1.02C.37 7.55 0 9.01 0 11.69s.37 4.14 1.02 5.44l4.01-3.14z" />
                <path fill="#EA4335" d="M12 4.75c1.79 0 3.4.62 4.67 1.82l3.5-3.5C18.07 1.14 15.3 0 12 0 7.21 0 3.03 2.86 1.02 6.85l4.01 3.14c.98-2.95 3.73-5.24 6.97-5.24z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-warm-border" />
              <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-cocoa-400">
                Or with Email
              </span>
              <div className="flex-grow border-t border-warm-border" />
            </div>

            {/* Mode Toggle: Sign In | Sign Up */}
            <div className="flex p-1 bg-warm-100 rounded-2xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  mode === 'signin' ? 'bg-white text-cocoa-900 shadow-sm' : 'text-cocoa-600 hover:text-cocoa-900'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  mode === 'signup' ? 'bg-white text-cocoa-900 shadow-sm' : 'text-cocoa-600 hover:text-cocoa-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mode: Sign In */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-cocoa-400 absolute left-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="camille@mefe.app"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900 focus:bg-white focus:outline-none focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-cocoa-400 absolute left-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900 focus:bg-white focus:outline-none focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs sm:text-sm shadow-terracotta transition-all flex items-center justify-center gap-2"
                >
                  <span>Log In to Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Mode: Sign Up */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-cocoa-400 absolute left-3.5" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Camille Lauren"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-warm-border bg-warm-50 text-cocoa-900 focus:bg-white focus:outline-none focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-cocoa-400 absolute left-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-warm-border bg-warm-50 text-cocoa-900 focus:bg-white focus:outline-none focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                    Create Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-cocoa-400 absolute left-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-warm-border bg-warm-50 text-cocoa-900 focus:bg-white focus:outline-none focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs sm:text-sm shadow-terracotta transition-all flex items-center justify-center gap-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Automatic Save Assurance Footer */}
            <div className="mt-5 pt-3 border-t border-warm-100 flex items-center justify-center gap-1.5 text-[11px] text-cocoa-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Your wardrobe, outfits & journals are automatically saved</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
