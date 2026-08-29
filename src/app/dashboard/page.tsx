'use client';

import Link from 'next/link';

export default function DashboardOverviewPage() {
  const statCards = [
    { label: 'Active Enrolments', value: '3', change: '+1 this month', color: 'emerald' },
    { label: 'Course Progress', value: '65%', change: 'On track', color: 'blue' },
    { label: 'Completed Tracks', value: '2', change: 'IBM Verified', color: 'purple' },
    { label: 'Mentorship Hours', value: '18h', change: 'Top 10%', color: 'amber' },
  ];

  const courses = [
    {
      id: 'c1',
      title: 'IBM SkillsBuild - Frontend Development',
      category: 'Web Development',
      partner: 'IBM SkillsBuild',
      difficulty: 'Beginner',
      duration: '4 weeks',
      progress: 75,
      trainer: 'Maya Patel',
    },
    {
      id: 'c2',
      title: 'Applied AI & Machine Learning Foundations',
      category: 'Artificial Intelligence',
      partner: 'GlobeSkill AI Academy',
      difficulty: 'Intermediate',
      duration: '6 weeks',
      progress: 40,
      trainer: 'Dr. Aris Thorne',
    },
    {
      id: 'c3',
      title: 'Cloud Computing & IT Infrastructure',
      category: 'Cloud Engineering',
      partner: 'IBM SkillsBuild',
      difficulty: 'Beginner',
      duration: '3 weeks',
      progress: 15,
      trainer: 'Maya Patel',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Phase 1: Foundation &amp; Skill Development
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome to your GlobeSkill Workspace
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Track your interactive learning journey, manage your cohort enrolments, and access certified tech curriculums.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/dashboard/student"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shadow-sm"
          >
            Open Student Learning Hub &rarr;
          </Link>
          <Link
            href="/test"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-900/70 hover:bg-emerald-900 text-white border border-emerald-500/30 transition-colors"
          >
            Open DB &amp; Role Test Console
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-900/70 hover:bg-emerald-900 text-white border border-emerald-500/30 transition-colors"
          >
            Explore Public Portal
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
          >
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {stat.label}
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900">{stat.value}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Learning Tracks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Learning Tracks</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sponsored and accredited by industry partners.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700">{course.partner}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    {course.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {course.title}
                </h3>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>Trainer: <span className="font-medium text-slate-700">{course.trainer}</span></div>
                  <div>Duration: <span className="font-medium text-slate-700">{course.duration}</span></div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-emerald-700">{course.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
