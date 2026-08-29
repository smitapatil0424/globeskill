'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserRole } from '@/types/database';

interface TableDiagnostic {
  name: string;
  exists: boolean;
  count: number;
  sample?: Record<string, unknown> | null;
  error?: string | null;
}

interface DbTestResponse {
  timestamp: string;
  mode: 'live' | 'mock';
  status: 'connected' | 'unconfigured' | 'error';
  latencyMs?: number;
  supabaseUrl: string;
  hasAnonKey: boolean;
  hasServiceRoleKey: boolean;
  tables: Record<string, TableDiagnostic>;
  message: string;
  details?: string;
}

interface RoutePermissionTest {
  path: string;
  expectedStatus: 'ALLOW' | 'REDIRECT_LOGIN' | 'REDIRECT_UNAUTHORIZED' | 'REDIRECT_HOME';
  description: string;
}

interface RoleEvaluation {
  role: UserRole | 'Guest';
  displayName: string;
  badgeColor: string;
  canAccessAdmin: boolean;
  canAccessDashboard: boolean;
  tableAccess: {
    profiles: string;
    training_projects: string;
    student_enrolments: string;
    donations: string;
  };
  routeMatrix: Record<string, RoutePermissionTest>;
}

export default function DatabaseAndRoleTestPage() {
  const [dbData, setDbData] = useState<DbTestResponse | null>(null);
  const [rbacData, setRbacData] = useState<{ roles: RoleEvaluation[] } | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | 'Guest'>('NGO Administrator');
  const [activeTab, setActiveTab] = useState<'tables' | 'rbac' | 'guide'>('tables');
  const [expandedSample, setExpandedSample] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const fetchDbDiagnostics = async () => {
    setIsLoadingDb(true);
    try {
      const res = await fetch('/api/test/db');
      const json: DbTestResponse = await res.json();
      setDbData(json);
    } catch (err) {
      console.error('Failed to probe DB diagnostics:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        const [dbRes, rbacRes] = await Promise.all([
          fetch('/api/test/db'),
          fetch('/api/test/rbac'),
        ]);

        if (!ignore) {
          if (dbRes.ok) {
            const dbJson: DbTestResponse = await dbRes.json();
            setDbData(dbJson);
          }
          if (rbacRes.ok) {
            const rbacJson = await rbacRes.json();
            setRbacData(rbacJson);
          }
        }
      } catch (err) {
        console.error('Failed to probe diagnostics:', err);
      } finally {
        if (!ignore) {
          setIsLoadingDb(false);
        }
      }
    }

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const currentRoleEval = rbacData?.roles.find((r) => r.role === selectedRole);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(label);
    setTimeout(() => setCopiedScript(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
                GS
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                GlobeSkill <span className="text-emerald-400 font-semibold text-sm">| Test Console</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              v1.0 Diagnostic Suite
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="refresh-db-btn"
              onClick={fetchDbDiagnostics}
              disabled={isLoadingDb}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{isLoadingDb ? 'Testing...' : 'Probe Database'}</span>
            </button>
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              &larr; Return Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Diagnostic Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Environment & Connection Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Database &amp; RBAC Role Verification
                </h1>
                {dbData?.mode === 'live' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    ● Live Supabase
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700">
                    ● Local Mock Mode
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {dbData?.message || 'Inspecting database tables and verifying role-based security access matrices.'}
              </p>
            </div>

            {/* Diagnostic Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Supabase Endpoint</span>
                <span className="text-xs font-semibold text-emerald-400 truncate block mt-0.5" title={dbData?.supabaseUrl}>
                  {dbData?.supabaseUrl || 'Loading...'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Latency</span>
                <span className="text-xs font-semibold text-white block mt-0.5">
                  {dbData?.latencyMs !== undefined ? `${dbData.latencyMs} ms` : '--'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Admin Key</span>
                <span className={`text-xs font-semibold block mt-0.5 ${dbData?.hasServiceRoleKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {dbData?.hasServiceRoleKey ? 'Configured' : 'Unset (Optional)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-8 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('tables')}
            className={`pb-3 transition-colors relative cursor-pointer ${
              activeTab === 'tables' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Database Tables ({dbData?.tables ? Object.keys(dbData.tables).length : 4})
            {activeTab === 'tables' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`pb-3 transition-colors relative cursor-pointer ${
              activeTab === 'rbac' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Role Simulator &amp; RBAC Matrix (5 Roles)
            {activeTab === 'rbac' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 transition-colors relative cursor-pointer ${
              activeTab === 'guide' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Setup Guide &amp; SQL Migrations
            {activeTab === 'guide' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: DATABASE TABLES */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dbData?.tables &&
                Object.entries(dbData.tables).map(([tableName, diag]) => (
                  <div
                    key={tableName}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {tableName}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            diag.exists ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <div className="text-2xl font-black text-white mt-1">{diag.count}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Records in table</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status</span>
                      <span className={diag.exists ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                        {diag.exists ? 'Queryable' : 'Missing / Error'}
                      </span>
                    </div>

                    {diag.sample && (
                      <button
                        onClick={() => setExpandedSample(expandedSample === tableName ? null : tableName)}
                        className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center justify-center py-1 rounded bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                      >
                        {expandedSample === tableName ? 'Hide Sample Row' : 'View Sample Row'}
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* Sample Record Drawer if open */}
            {expandedSample && dbData?.tables[expandedSample]?.sample && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-900/50 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Sample Record: {expandedSample}
                  </span>
                  <button
                    onClick={() => setExpandedSample(null)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Close &times;
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                  {JSON.stringify(dbData.tables[expandedSample].sample, null, 2)}
                </pre>
              </div>
            )}

            {/* Schema Contract Overview */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white">PostgreSQL Schema Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="font-semibold text-emerald-400 block font-mono">public.profiles</span>
                  <p className="text-slate-400">
                    Stores user identity synchronized with Supabase Auth via trigger. Contains role enum (Student, Trainer, Volunteer, Donor, NGO Administrator), verification flag, bio, and org affiliations.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="font-semibold text-emerald-400 block font-mono">public.training_projects</span>
                  <p className="text-slate-400">
                    Stores technical training tracks (e.g., IBM SkillsBuild Frontend, AI Academy). Includes duration, difficulty, capacity, trainer references, and active publishing status.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="font-semibold text-emerald-400 block font-mono">public.student_enrolments</span>
                  <p className="text-slate-400">
                    Associates learners with tracks. Tracks completion status, numerical percentage progress (0-100), and issued digital completion certificates.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="font-semibold text-emerald-400 block font-mono">public.donations</span>
                  <p className="text-slate-400">
                    Financial ledger storing sponsor grants and public donations with payment transaction IDs, currencies, earmarked projects, and anonymity flags.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RBAC ROLE SIMULATOR */}
        {activeTab === 'rbac' && (
          <div className="space-y-6">
            {/* Role Switcher Pill Bar */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Select Active Role to Simulate
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { role: 'NGO Administrator', icon: '👑', label: 'NGO Administrator' },
                  { role: 'Trainer', icon: '👨‍🏫', label: 'Trainer' },
                  { role: 'Student', icon: '🎓', label: 'Student' },
                  { role: 'Volunteer', icon: '🤝', label: 'Volunteer' },
                  { role: 'Donor', icon: '💖', label: 'Donor' },
                  { role: 'Guest', icon: '👤', label: 'Unauthenticated Guest' },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => setSelectedRole(item.role as UserRole | 'Guest')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                      selectedRole === item.role
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Role Evaluation Card */}
            {currentRoleEval && (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-bold text-white">{currentRoleEval.displayName}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {currentRoleEval.canAccessAdmin ? 'Full Admin Access' : 'Standard Member Access'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      Evaluated against Next.js Edge Middleware and Supabase RLS security policies.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/admin"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      target="_blank"
                    >
                      Test Navigating to /admin &rarr;
                    </Link>
                  </div>
                </div>

                {/* Route Guard Behavior Matrix */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Route Protection &amp; Middleware Behavior
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(currentRoleEval.routeMatrix).map(([path, check]) => {
                      const isAllowed = check.expectedStatus === 'ALLOW';
                      const is403 = check.expectedStatus === 'REDIRECT_UNAUTHORIZED';
                      const is307Login = check.expectedStatus === 'REDIRECT_LOGIN';

                      return (
                        <div key={path} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-white">{path}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isAllowed
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : is403
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : is307Login
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {check.expectedStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{check.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Row-Level Security Table Privileges */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Supabase Table RLS Permissions for {currentRoleEval.displayName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="font-semibold text-slate-200 font-mono block">profiles</span>
                      <span className="text-slate-400 mt-1 block">{currentRoleEval.tableAccess.profiles}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="font-semibold text-slate-200 font-mono block">training_projects</span>
                      <span className="text-slate-400 mt-1 block">{currentRoleEval.tableAccess.training_projects}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="font-semibold text-slate-200 font-mono block">student_enrolments</span>
                      <span className="text-slate-400 mt-1 block">{currentRoleEval.tableAccess.student_enrolments}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="font-semibold text-slate-200 font-mono block">donations</span>
                      <span className="text-slate-400 mt-1 block">{currentRoleEval.tableAccess.donations}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETUP GUIDE & MIGRATIONS */}
        {activeTab === 'guide' && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Live Supabase Setup Instructions</h2>
              <p className="text-slate-400 text-xs mt-1">
                Follow these steps to connect your project to a live Supabase PostgreSQL database:
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Step 1: Configure Environment Variables</span>
                </div>
                <p className="text-xs text-slate-400">
                  Update <code className="text-emerald-300">globeskill/.env.local</code> with your keys from your Supabase Dashboard:
                </p>
                <pre className="p-3 rounded-lg bg-slate-950 text-xs font-mono text-slate-300 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-public-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-private-service-role-key>`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Step 2: Run SQL Migrations in Supabase SQL Editor</span>
                </div>
                <p className="text-xs text-slate-400">
                  Execute the SQL files located in <code className="text-emerald-300">supabase/</code> in order:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-white block">1. schema.sql</span>
                    <span className="text-slate-500">Creates tables, types, and indexes</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-white block">2. auth_profile_trigger.sql</span>
                    <span className="text-slate-500">Creates user sync trigger</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-white block">3. rls_policies.sql</span>
                    <span className="text-slate-500">Enables Row Level Security &amp; RBAC</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-white block">4. seed.sql</span>
                    <span className="text-slate-500">Seeds trainers, students, projects</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Step 3: Run the CLI Test Suite</span>
                  <button
                    onClick={() => copyToClipboard('npm run test:db', 'cli')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                  >
                    {copiedScript === 'cli' ? 'Copied!' : 'Copy Command'}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Run the automated test runner directly from your terminal:
                </p>
                <pre className="p-3 rounded-lg bg-slate-950 text-xs font-mono text-emerald-300">
npm run test:db
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
