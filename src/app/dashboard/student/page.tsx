'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AIChat from '@/components/AIChat';

export interface EnrolledCourseItem {
  id: string;
  enrolmentId: string;
  title: string;
  slug: string;
  partner: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  progress: number;
  status: 'enrolled' | 'in_progress' | 'completed';
  currentModule: string;
  modules: { title: string; duration: string; completed: boolean }[];
}

export interface AvailableCourseItem {
  id: string;
  title: string;
  slug: string;
  partner: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  description: string;
  seatsRemaining: number;
  modulesCount: number;
}

// Initial Seed-matching Fallback Data (Mock & Offline Resiliency)
const DEFAULT_ENROLLED: EnrolledCourseItem[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    enrolmentId: 'e0000000-0000-0000-0000-000000000001',
    title: 'IBM SkillsBuild - Frontend Development',
    slug: 'ibm-skillsbuild-frontend-dev',
    partner: 'IBM SkillsBuild',
    category: 'Web Development',
    difficulty: 'Beginner',
    duration: '4 weeks',
    progress: 75,
    status: 'in_progress',
    currentModule: 'Module 3: Modern Responsive UI with Tailwind CSS',
    modules: [
      { title: 'Module 1: HTML5 Semantic Foundations & Accessibility', duration: '45 mins', completed: true },
      { title: 'Module 2: Modern CSS Layouts, Grid & Flexbox', duration: '60 mins', completed: true },
      { title: 'Module 3: Modern Responsive UI with Tailwind CSS', duration: '90 mins', completed: false },
      { title: 'Module 4: React 19 Components & Dynamic State', duration: '75 mins', completed: false },
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    enrolmentId: 'e0000000-0000-0000-0000-000000000002',
    title: 'Applied AI & Machine Learning Foundations',
    slug: 'ai-machine-learning-foundations',
    partner: 'GlobeSkill AI Academy',
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    duration: '6 weeks',
    progress: 40,
    status: 'in_progress',
    currentModule: 'Module 2: Neural Networks & Supervised Learning',
    modules: [
      { title: 'Module 1: Introduction to AI & Ethical Machine Learning', duration: '40 mins', completed: true },
      { title: 'Module 2: Neural Networks & Supervised Learning', duration: '80 mins', completed: false },
      { title: 'Module 3: Computer Vision & Text Processing Pipelines', duration: '90 mins', completed: false },
      { title: 'Module 4: Capstone: AI for Climate Impact Prediction', duration: '120 mins', completed: false },
    ],
  },
];

const DEFAULT_AVAILABLE: AvailableCourseItem[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Cloud Infrastructure & Cybersecurity Fundamentals',
    slug: 'cloud-infrastructure-cybersecurity',
    partner: 'IBM SkillsBuild',
    category: 'Cloud Engineering',
    difficulty: 'Beginner',
    duration: '3 weeks',
    description: 'Learn fundamental cloud architecture concepts, VPC networking, encryption protocols, and essential IT security hygiene.',
    seatsRemaining: 18,
    modulesCount: 5,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Full-Stack Web Engineering with Next.js & Supabase',
    slug: 'fullstack-nextjs-supabase',
    partner: 'GlobeSkill Tech Hub',
    category: 'Web Development',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    description: 'Master modern server-side rendering, PostgreSQL relational schema design, Edge Middleware RBAC, and cloud deployment.',
    seatsRemaining: 8,
    modulesCount: 8,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    title: 'Data Literacy & Python for Young Scientists',
    slug: 'data-literacy-python',
    partner: 'Nairobi Youth Digital Lab',
    category: 'Data Science',
    difficulty: 'Beginner',
    duration: '5 weeks',
    description: 'Practical introduction to Python programming, Pandas data wrangling, and interactive charting for solving community problems.',
    seatsRemaining: 24,
    modulesCount: 6,
  },
];

export default function StudentDashboardPage() {
  const supabase = createClient();

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseItem[]>(DEFAULT_ENROLLED);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourseItem[]>(DEFAULT_AVAILABLE);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState('GlobeSkill Learner');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeModalCourse, setActiveModalCourse] = useState<EnrolledCourseItem | null>(null);

  // Load student identity and active enrolments from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadStudentData() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (user && isMounted) {
          setStudentName(user.user_metadata?.full_name || 'GlobeSkill Learner');

          // Query live enrolments from Supabase
          const { data: dbEnrolments } = await supabase
            .from('student_enrolments')
            .select(`
              id,
              project_id,
              status,
              progress_percentage,
              training_projects (
                id,
                title,
                slug,
                description,
                partner_organization,
                category,
                difficulty_level,
                duration_weeks
              )
            `)
            .eq('student_id', user.id);

          if (dbEnrolments && dbEnrolments.length > 0 && isMounted) {
            const mapped: EnrolledCourseItem[] = dbEnrolments
              .filter((e) => e.training_projects)
              .map((e) => {
                const p = e.training_projects as unknown as {
                  id: string;
                  title: string;
                  slug: string;
                  partner_organization: string;
                  category: string;
                  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
                  duration_weeks: number;
                };

                return {
                  id: p.id,
                  enrolmentId: e.id,
                  title: p.title,
                  slug: p.slug,
                  partner: p.partner_organization,
                  category: p.category,
                  difficulty: p.difficulty_level,
                  duration: `${p.duration_weeks} weeks`,
                  progress: e.progress_percentage || 0,
                  status: e.status || 'enrolled',
                  currentModule: 'Module 1: Getting Started with Track',
                  modules: [
                    { title: 'Module 1: Getting Started & Course Setup', duration: '40 mins', completed: (e.progress_percentage || 0) > 20 },
                    { title: 'Module 2: Core Concepts & Practice Exercises', duration: '60 mins', completed: (e.progress_percentage || 0) > 60 },
                    { title: 'Module 3: Hands-on Project Implementation', duration: '90 mins', completed: (e.progress_percentage || 0) >= 100 },
                  ],
                };
              });

            setEnrolledCourses(mapped);

            // Filter out already enrolled courses from available list
            const enrolledIds = new Set(mapped.map((m) => m.id));
            setAvailableCourses((prev) => prev.filter((c) => !enrolledIds.has(c.id)));
          }
        }
      } catch (err) {
        console.warn('Using mock student enrolment data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStudentData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Overall progress calculation
  const overallProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)
    : 0;

  // Handle Enrollment via secure API endpoint
  const handleEnroll = async (course: AvailableCourseItem) => {
    setEnrollingId(course.id);

    try {
      // Invoke secure backend API endpoint with double-enrollment guard
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: course.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setSuccessToast(`Notice: ${data.error || 'You are already enrolled in this course.'}`);
          setTimeout(() => setSuccessToast(null), 4500);
          return;
        }
        throw new Error(data.error || 'Failed to complete course enrollment.');
      }

      // Add to enrolled tracks with In-Progress status
      const newEnrolled: EnrolledCourseItem = {
        id: course.id,
        enrolmentId: data.enrolment?.id || `enrolled-${course.id}`,
        title: course.title,
        slug: course.slug,
        partner: course.partner,
        category: course.category,
        difficulty: course.difficulty,
        duration: course.duration,
        progress: 0,
        status: 'in_progress', // In-Progress status
        currentModule: 'Module 1: Orientation & Track Foundations',
        modules: [
          { title: 'Module 1: Orientation & Track Foundations', duration: '30 mins', completed: false },
          { title: 'Module 2: Practical Skills & Code Lab', duration: '60 mins', completed: false },
          { title: 'Module 3: Project Milestone & Peer Review', duration: '90 mins', completed: false },
        ],
      };

      setEnrolledCourses((prev) => [newEnrolled, ...prev]);
      setAvailableCourses((prev) => prev.filter((c) => c.id !== course.id));
      setSuccessToast(`🎉 Success! Enrolled in "${course.title}". Status set to In-Progress.`);

      setTimeout(() => {
        setSuccessToast(null);
      }, 5000);
    } catch (err) {
      console.error('Enrollment error:', err);
      setSuccessToast(err instanceof Error ? err.message : 'Registration error. Please try again.');
      setTimeout(() => setSuccessToast(null), 4000);
    } finally {
      setEnrollingId(null);
    }
  };

  // Filter available courses
  const categories = ['All', 'Web Development', 'Artificial Intelligence', 'Cloud Engineering', 'Data Science'];
  const filteredAvailable = activeCategory === 'All'
    ? availableCourses
    : availableCourses.filter((c) => c.category === activeCategory);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-emerald-900 text-white border border-emerald-500/50 shadow-2xl flex items-center space-x-3 animate-slide-up max-w-md"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            ✓
          </div>
          <p className="text-xs sm:text-sm font-medium">{successToast}</p>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-300 hover:text-white text-xs cursor-pointer ml-auto"
          >
            &times;
          </button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 1. STUDENT WELCOME & OVERALL PROGRESS HERO CARD */}
      {/* ======================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 border border-emerald-900/40 shadow-xl relative overflow-hidden text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Student Learning Center</span>
              {isLoading && <span className="text-[10px] text-emerald-400 font-normal ml-1">· Syncing...</span>}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-emerald-400">{studentName}</span>!
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Keep up the momentum! You have <strong className="text-white">{enrolledCourses.length} active tracks</strong> in progress. Complete your weekly milestones to unlock your IBM SkillsBuild digital credential.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold">●</span>
                <span>Active Track: <strong>{enrolledCourses[0]?.title || 'None'}</strong></span>
              </span>
              <span className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold">★</span>
                <span>Credentials Earned: <strong>1 Verified</strong></span>
              </span>
            </div>
          </div>

          {/* Overall Progress Gauge Widget */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-slate-900/90 border border-emerald-800/40 shadow-inner flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Curriculum Progress
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                {overallProgress}% Complete
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline justify-between mb-1.5 text-xs">
                <span className="text-slate-400">Average Track Completion</span>
                <span className="font-mono font-bold text-white text-lg">{overallProgress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm shadow-emerald-500/50"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span>{enrolledCourses.length} Registered Courses</span>
              <span className="text-emerald-400 font-medium">On Track &uarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. ENROLLED COURSES SECTION */}
      {/* ======================================================================= */}
      <section aria-labelledby="enrolled-heading" className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="enrolled-heading" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Active Enrolments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Continue your ongoing courses and access interactive learning modules.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {enrolledCourses.length} Active Courses
          </span>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl">
              📚
            </div>
            <h3 className="font-bold text-slate-800 text-base">No active enrolments yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore the available courses below and click &quot;Enroll Now&quot; to begin learning!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {course.partner}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 font-medium">{course.duration}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {course.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {course.title}
                  </h3>

                  {/* Current Active Module */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Next Step / Active Module
                    </span>
                    <span className="text-xs font-medium text-slate-800 block">
                      {course.currentModule}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Course Progress</span>
                      <span className="text-emerald-700">{course.progress}% Complete</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Open Learning Module Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 font-medium">
                    {course.modules.length} Core Modules
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveModalCourse(course)}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Open Learning Module</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================================= */}
      {/* 3. AVAILABLE SKILLING COURSES GRID */}
      {/* ======================================================================= */}
      <section aria-labelledby="available-heading" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="available-heading" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Available Skilling Courses
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Discover accredited technology paths, enrol with one click, and learn at your own pace.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredAvailable.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">No courses match this category filter.</p>
            <button
              onClick={() => setActiveCategory('All')}
              className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Show all courses &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAvailable.map((course) => {
              const isEnrolling = enrollingId === course.id;

              return (
                <div
                  key={course.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-700">{course.partner}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {course.difficulty}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-800 transition-colors">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                      <span>Duration: <strong>{course.duration}</strong></span>
                      <span><strong>{course.modulesCount}</strong> modules</span>
                      <span className="text-emerald-700 font-medium">{course.seatsRemaining} spots left</span>
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      id={`enroll-btn-${course.slug}`}
                      onClick={() => handleEnroll(course)}
                      disabled={isEnrolling}
                      className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isEnrolling ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Enrolling...</span>
                        </>
                      ) : (
                        <>
                          <span>Enroll Now</span>
                          <span>&rarr;</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================================================================= */}
      {/* 4. INTERACTIVE MODULE SYLLABUS VIEWER MODAL */}
      {/* ======================================================================= */}
      {activeModalCourse && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {activeModalCourse.partner}
                </span>
                <h3 id="modal-title" className="text-xl font-bold text-slate-900 mt-1">
                  {activeModalCourse.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track Progress: {activeModalCourse.progress}% Complete
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCourse(null)}
                aria-label="Close modal"
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modules List */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Course Syllabus &amp; Modules
              </span>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activeModalCourse.modules.map((mod, idx) => (
                  <div
                    key={mod.title}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      mod.completed
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                          mod.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {mod.completed ? '✓' : idx + 1}
                      </span>
                      <span className="font-semibold truncate">{mod.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex-shrink-0 ml-2 font-medium">
                      {mod.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveModalCourse(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <Link
                href="/dashboard/student/quiz"
                onClick={() => setActiveModalCourse(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>Launch Milestone Quiz &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. SLIDE-OUT AI TECHNICAL ASSISTANT */}
      <AIChat courseContext="Student Skilling Hub & Certifications" />
    </div>
  );
}
