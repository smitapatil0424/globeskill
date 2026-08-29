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
      // Sign up via Supabase Auth with metadata for the DB trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role as UserRole,
          },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        // Auto-confirmed session (email confirmation turned off in Supabase)
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      } else {
        // Email confirmation is required
        setSuccessMessage(
          'Registration successful! Please check your email to confirm your account before logging in.'
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-lg shadow-sm">
            GS
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            GlobeSkill
          </span>
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Join the community empowering underserved youth with digital and AI skills.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm rounded-2xl border border-slate-200">
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start space-x-3"
            >
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-start space-x-3"
            >
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maria Hernandez"
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors sm:text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700">
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
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors sm:text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors sm:text-sm"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Your Role in GlobeSkill
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Student */}
                <label
                  className={`relative flex flex-col p-4 cursor-pointer rounded-xl border transition-all ${
                    role === 'Student'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
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
                  <span className="font-semibold text-slate-900 text-sm">Student</span>
                  <span className="text-xs text-slate-500 mt-1">
                    Learn AI, tech skills &amp; earn certifications
                  </span>
                </label>

                {/* Trainer */}
                <label
                  className={`relative flex flex-col p-4 cursor-pointer rounded-xl border transition-all ${
                    role === 'Trainer'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
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
                  <span className="font-semibold text-slate-900 text-sm">Trainer</span>
                  <span className="text-xs text-slate-500 mt-1">
                    Lead cohorts, mentor &amp; review projects
                  </span>
                </label>

                {/* Volunteer */}
                <label
                  className={`relative flex flex-col p-4 cursor-pointer rounded-xl border transition-all ${
                    role === 'Volunteer'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
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
                  <span className="font-semibold text-slate-900 text-sm">Volunteer</span>
                  <span className="text-xs text-slate-500 mt-1">
                    Support community events &amp; local chapters
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Creating account...</span>
                  </span>
                ) : (
                  'Create GlobeSkill Account'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
