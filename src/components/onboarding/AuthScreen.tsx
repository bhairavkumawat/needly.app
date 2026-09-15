import React, { useState } from 'react';
import { 
  Mail, 
  User, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface AuthScreenProps {
  onBackToSlides: () => void;
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBackToSlides, onSuccess }) => {
  const { 
    loginWithEmail, 
    loginWithGoogle, 
    registerNewUser, 
    switchUser,
    allProfiles,
    currentLocation,
    isValidEmailFormat
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [email, setEmail] = useState('sayyedamaan2004@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState(currentLocation.city || 'Udaipur');
  const [regError, setRegError] = useState('');

  // Handle Sign In Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setLoginError('Please enter your email address.');
      return;
    }

    if (!isValidEmailFormat(cleanEmail)) {
      setLoginError('Please enter a valid email format (e.g. name@domain.com).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = loginWithEmail(cleanEmail, password);
      if (res.success) {
        onSuccess();
      } else {
        setLoginError(res.message || 'Incorrect email or password. Please try again.');
      }
    }, 350);
  };

  // Handle Google Sign In
  const handleGoogleLogin = () => {
    setLoginError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      try {
        loginWithGoogle('Aarav Sharma', 'sayyedamaan2004@gmail.com');
        onSuccess();
      } catch (err: unknown) {
        setLoginError((err as Error).message || 'Google sign in failed.');
      }
    }, 350);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setRegError('Please enter your email address.');
      return;
    }

    if (!isValidEmailFormat(cleanEmail)) {
      setRegError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = regPhone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setRegError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      try {
        registerNewUser({
          name: regName.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          city: regCity.trim() || 'Udaipur',
          roleInterest: 'both'
        });
        onSuccess();
      } catch (err: unknown) {
        setRegError((err as Error).message || 'Registration failed. Please try again.');
      }
    }, 400);
  };

  // Quick Demo Account Selector
  const handleQuickDemo = (demoEmail: string, demoPassword = '123456') => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoginError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = loginWithEmail(demoEmail, demoPassword);
      if (res.success) {
        onSuccess();
      } else {
        const found = allProfiles.find(p => p.email && p.email.toLowerCase() === demoEmail.toLowerCase());
        if (found) {
          switchUser(found);
          onSuccess();
        }
      }
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen justify-between px-6 py-6 select-none bg-white">
      {/* Top Bar: Navigation & Guest Skip */}
      <div className="flex items-center justify-between shrink-0 mb-4">
        <button
          type="button"
          id="auth-back-btn"
          onClick={onBackToSlides}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          id="auth-skip-btn"
          onClick={onSuccess}
          className="text-xs text-teal-700 hover:text-teal-800 font-medium transition-colors cursor-pointer py-1"
        >
          Explore as Guest →
        </button>
      </div>

      {/* Main Centered Auth Form Box */}
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center my-auto">
        {/* Brand Monogram & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white font-serif font-bold text-2xl shadow-xs mb-3">
            N
          </div>
          <h1 className="font-serif text-2xl font-normal text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome to Needly' : 'Create an Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {mode === 'login' 
              ? 'Borrow gear & hire trusted services nearby' 
              : 'Join your neighborhood community to borrow & share'}
          </p>

          {/* Simple Tab Pill */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl mt-5 border border-slate-200/80">
            <button
              type="button"
              id="auth-tab-signin"
              onClick={() => { setMode('login'); setLoginError(''); setRegError(''); }}
              className={`px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => { setMode('register'); setLoginError(''); setRegError(''); }}
              className={`px-5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mode === 'register' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Content Animated Container */}
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {/* Email Input */}
                <div>
                  <label 
                    htmlFor="login-email-input" 
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      id="login-email-input"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="name@domain.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label 
                      htmlFor="login-password-input" 
                      className="text-xs font-medium text-slate-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      id="login-forgot-btn"
                      onClick={() => setForgotSent(true)}
                      className="text-[11px] text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password-input"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      id="login-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot message confirmation */}
                {forgotSent && (
                  <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Demo account password reset: Use default &quot;123456&quot;.</span>
                  </div>
                )}

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{loginError}</p>
                      {loginError.includes('sign up') && (
                        <button
                          type="button"
                          onClick={() => {
                            setRegEmail(email);
                            setMode('register');
                            setLoginError('');
                          }}
                          className="mt-1 font-medium underline text-teal-700 block cursor-pointer"
                        >
                          Create an account now →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Sign In Primary Button */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Minimal Divider */}
              <div className="relative flex items-center justify-center pt-1">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2.5 text-[11px] text-slate-400 absolute">
                  or
                </span>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                id="login-google-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm shadow-2xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Quick Demo Logins */}
              <div className="pt-2">
                <p className="text-[11px] text-slate-400 text-center mb-1.5">
                  Quick test login:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    id="demo-login-aarav"
                    onClick={() => handleQuickDemo('sayyedamaan2004@gmail.com')}
                    className="text-xs text-teal-700 bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/70 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Aarav (Renter)
                  </button>
                  <button
                    type="button"
                    id="demo-login-vikram"
                    onClick={() => handleQuickDemo('vikram.mehta@example.com')}
                    className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Vikram (Owner)
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label 
                    htmlFor="signup-name-input" 
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      id="signup-name-input"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Amaan Sayyed"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label 
                    htmlFor="signup-email-input" 
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      id="signup-email-input"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        setRegError('');
                      }}
                      placeholder="name@domain.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label 
                    htmlFor="signup-phone-input" 
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      id="signup-phone-input"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label 
                    htmlFor="signup-city-input" 
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    City / Neighborhood
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      id="signup-city-input"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="e.g. Udaipur"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Register Error Banner */}
                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p>{regError}</p>
                  </div>
                )}

                {/* Submit Register Button */}
                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center pt-1 leading-snug">
                  By joining, you agree to Needly&apos;s Community Guidelines.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Mode Switcher */}
        <div className="text-center mt-6 pt-3 border-t border-slate-100">
          {mode === 'login' ? (
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setLoginError(''); }}
                className="text-teal-700 hover:text-teal-800 font-medium cursor-pointer"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setRegError(''); }}
                className="text-teal-700 hover:text-teal-800 font-medium cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Simple, Basic Bottom Brand Accent */}
      <div className="shrink-0 text-center pt-4">
        <span className="text-[11px] text-slate-400">
          Needly • Hyperlocal Community Marketplace
        </span>
      </div>
    </div>
  );
};
