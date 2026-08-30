'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);

  // Quick fill helper for testing different roles
  const handleQuickFill = (role: 'admin' | 'trainer' | 'student') => {
    setSelectedDemoRole(role);
    setErrorMessage(null);
    if (role === 'admin') {
      setEmail('admin@globeskill.org');
      setPassword('AdminPassword123!');
    } else if (role === 'trainer') {
      setEmail('aris.thorne@globeskill.org');
      setPassword('Password123!');
    } else if (role === 'student') {
      setEmail('liam.chen@student.globeskill.org');
      setPassword('Password123!');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const userRole = data.user.user_metadata?.role;
        // Direct routing based on user role
        if (userRole === 'NGO Administrator') {
          router.push('/dashboard/admin');
        } else if (userRole === 'Trainer') {
          router.push('/dashboard/trainer');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Invalid login credentials. Please check your email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[160px] pointer-events-none" />

      {/* Subtle Grid Backdrop Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-5xl relative z-10 mx-auto">
        
        {/* Top Navbar Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform duration-200">
              GS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">GlobeSkill</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NGO Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Technology & AI Skilling Initiative</p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-slate-800"
          >
            <span>&larr;</span>
            <span>Public Home</span>
          </Link>
        </div>

        {/* Auth Card with Split-Screen Design */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Brand & Impact Showcase (Hidden on tiny screens) */}
          <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                United Nations SDGs 4 & 8
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Empowering Youth with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Free AI & Digital Skills
                </span>
              </h2>

              <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                Connect to industry-standard learning tracks certified with IBM SkillsBuild, track student progress, and manage live cohorts.
              </p>

              {/* Feature Highlights */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">IBM SkillsBuild Partnership</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Industry certifications in Cloud, AI, and Cybersecurity.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-sm shrink-0 mt-0.5">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Role-Based Access Control</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Custom consoles for Students, Trainers, Donors, and Admins.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm shrink-0 mt-0.5">
                    🛡
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Row-Level Security (RLS)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Enterprise security protecting student cohorts & certificates.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Fill Buttons for Testing */}
            <div className="mt-10 pt-6 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                ⚡ 1-Click Quick Demo Login:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-center border ${
                    selectedDemoRole === 'admin'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                  }`}
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('trainer')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-center border ${
                    selectedDemoRole === 'trainer'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-200 shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                  }`}
                >
                  👨‍🏫 Trainer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('student')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-center border ${
                    selectedDemoRole === 'student'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                  }`}
                >
                  🎓 Student
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 bg-slate-900/60 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">
              
              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Welcome Back
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Please enter your credentials to access your GlobeSkill workspace.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300 flex items-start gap-3 animate-shake"
                >
                  <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-red-200">Authentication Failed</p>
                    <p className="mt-0.5 text-xs text-red-300/90">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                      </svg>
                    </div>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@globeskill.org"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-inner"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => alert('Password reset links are configured via Supabase Email Auth.')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] text-sm"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Authenticating Secure Session...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to GlobeSkill</span>
                        <span>&rarr;</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                <span>256-bit SSL Protected • Supabase RLS Guard</span>
              </div>

              {/* Signup Link */}
              <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-sm text-slate-400">
                New to GlobeSkill?{' '}
                <Link href="/signup" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Create a new account
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
