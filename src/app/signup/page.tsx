'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/types/database';

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'Student' | 'Trainer' | 'Volunteer'>('Student');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: role as UserRole,
          },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        setSuccessMessage('Account created successfully! Redirecting to your dashboard...');
        setTimeout(() => {
          if (role === 'Trainer') router.push('/dashboard/trainer');
          else router.push('/dashboard');
          router.refresh();
        }, 1200);
      } else {
        setSuccessMessage(
          'Registration successful! Please check your email inbox to verify your account.'
        );
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred during registration. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      {/* Ambient Radial Lights */}
      <div className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-emerald-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-teal-500/10 blur-[160px] pointer-events-none" />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="w-full max-w-2xl relative z-10 mx-auto">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform duration-200">
              GS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">GlobeSkill</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Join Free
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Empowering Underserved Youth with AI Skills</p>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-slate-800"
          >
            <span>Have an account?</span>
            <span className="text-emerald-400 font-semibold">Sign In</span>
          </Link>
        </div>

        {/* Signup Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl p-8 sm:p-10">
          
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Join thousands of learners and trainers on the open GlobeSkill platform.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300 flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              role="status"
              className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="full-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-inner"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-inner"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Create Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-4 pr-11 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm shadow-inner"
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

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Choose Your Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Student */}
                <label
                  className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border transition-all ${
                    role === 'Student'
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-sm shadow-emerald-950 ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="Student"
                    checked={role === 'Student'}
                    onChange={() => setRole('Student')}
                    className="sr-only"
                  />
                  <span className="text-xl mb-1">🎓</span>
                  <span className="font-semibold text-white text-sm">Student</span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    Learn AI & earn free certifications
                  </span>
                </label>

                {/* Trainer */}
                <label
                  className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border transition-all ${
                    role === 'Trainer'
                      ? 'border-blue-500 bg-blue-500/15 shadow-sm shadow-blue-950 ring-1 ring-blue-500'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="Trainer"
                    checked={role === 'Trainer'}
                    onChange={() => setRole('Trainer')}
                    className="sr-only"
                  />
                  <span className="text-xl mb-1">👨‍🏫</span>
                  <span className="font-semibold text-white text-sm">Trainer</span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    Teach cohorts & review submissions
                  </span>
                </label>

                {/* Volunteer */}
                <label
                  className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border transition-all ${
                    role === 'Volunteer'
                      ? 'border-teal-500 bg-teal-500/15 shadow-sm shadow-teal-950 ring-1 ring-teal-500'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="Volunteer"
                    checked={role === 'Volunteer'}
                    onChange={() => setRole('Volunteer')}
                    className="sr-only"
                  />
                  <span className="text-xl mb-1">🤝</span>
                  <span className="font-semibold text-white text-sm">Volunteer</span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    Support local skilling drives
                  </span>
                </label>
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create GlobeSkill Account</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Link */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
