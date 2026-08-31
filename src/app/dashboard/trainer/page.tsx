'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EnrolmentStatus } from '@/types/database';

export interface TrainerStudentRow {
  enrolmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  partner: string;
  status: EnrolmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt?: string | null;
  certificateUrl?: string | null;
}

// Fallback Mock Students matching GlobeSkill seed schema
const DEFAULT_TRAINER_STUDENTS: TrainerStudentRow[] = [
  {
    enrolmentId: 'e0000000-0000-0000-0000-000000000001',
    studentId: 'd0000000-0000-0000-0000-000000000003',
    studentName: 'Liam Chen',
    studentEmail: 'liam.chen@student.globeskill.org',
    courseId: 'c0000000-0000-0000-0000-000000000001',
    courseTitle: 'IBM SkillsBuild - Frontend Development',
    partner: 'IBM SkillsBuild',
    status: 'in_progress',
    progress: 75,
    enrolledAt: '2026-08-01T10:00:00Z',
  },
  {
    enrolmentId: 'e0000000-0000-0000-0000-000000000002',
    studentId: 'd0000000-0000-0000-0000-000000000004',
    studentName: 'Amina Diallo',
    studentEmail: 'amina.diallo@student.globeskill.org',
    courseId: 'c0000000-0000-0000-0000-000000000002',
    courseTitle: 'Applied AI & Machine Learning Foundations',
    partner: 'GlobeSkill AI Academy',
    status: 'in_progress',
    progress: 90,
    enrolledAt: '2026-08-05T14:30:00Z',
  },
  {
    enrolmentId: 'e0000000-0000-0000-0000-000000000003',
    studentId: 'd0000000-0000-0000-0000-000000000005',
    studentName: 'Carlos Mendoza',
    studentEmail: 'carlos.m@student.globeskill.org',
    courseId: 'c0000000-0000-0000-0000-000000000003',
    courseTitle: 'Cloud Infrastructure & Cybersecurity Fundamentals',
    partner: 'IBM SkillsBuild',
    status: 'enrolled',
    progress: 15,
    enrolledAt: '2026-08-10T09:15:00Z',
  },
  {
    enrolmentId: 'e0000000-0000-0000-0000-000000000004',
    studentId: 'd0000000-0000-0000-0000-000000000007',
    studentName: 'Fatima Al-Mansoor',
    studentEmail: 'fatima.m@student.globeskill.org',
    courseId: 'c0000000-0000-0000-0000-000000000001',
    courseTitle: 'IBM SkillsBuild - Frontend Development',
    partner: 'IBM SkillsBuild',
    status: 'completed',
    progress: 100,
    enrolledAt: '2026-07-15T11:00:00Z',
    completedAt: '2026-08-20T16:00:00Z',
    certificateUrl: 'https://credentials.globeskill.org/certs/e4',
  },
  {
    enrolmentId: 'e0000000-0000-0000-0000-000000000005',
    studentId: 'd0000000-0000-0000-0000-000000000008',
    studentName: 'Kofi Mensah',
    studentEmail: 'kofi.mensah@student.globeskill.org',
    courseId: 'c0000000-0000-0000-0000-000000000002',
    courseTitle: 'Applied AI & Machine Learning Foundations',
    partner: 'GlobeSkill AI Academy',
    status: 'enrolled',
    progress: 0,
    enrolledAt: '2026-08-24T08:00:00Z',
  },
];

const STATUS_CONFIG: Record<
  EnrolmentStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  enrolled: {
    label: 'Not Started',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  in_progress: {
    label: 'In-Progress',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  completed: {
    label: 'Graduated',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  dropped: {
    label: 'Dropped',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

export default function TrainerDashboardPage() {
  const supabase = createClient();

  const [students, setStudents] = useState<TrainerStudentRow[]>(DEFAULT_TRAINER_STUDENTS);
  const [trainerName, setTrainerName] = useState('Dr. Aris Thorne');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Trainer's courses & assigned student enrolments
  useEffect(() => {
    let isMounted = true;

    async function loadTrainerData() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (user && isMounted) {
          let name = user.user_metadata?.full_name;
          if (!name) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single();
            if (prof?.full_name) name = prof.full_name;
          }
          setTrainerName(name || 'Trainer');

          // Query live enrolments for courses assigned to this trainer
          const { data: dbData } = await supabase
            .from('student_enrolments')
            .select(`
              id,
              student_id,
              project_id,
              status,
              progress_percentage,
              enrolled_at,
              completed_at,
              certificate_url,
              profiles:student_id (
                id,
                full_name,
                email
              ),
              training_projects:project_id (
                id,
                title,
                partner_organization,
                trainer_id
              )
            `);

          if (dbData && dbData.length > 0 && isMounted) {
            const mapped: TrainerStudentRow[] = dbData
              .filter((row) => row.training_projects && row.profiles)
              .map((row) => {
                const p = row.profiles as unknown as { full_name: string; email: string };
                const t = row.training_projects as unknown as { id: string; title: string; partner_organization: string };

                return {
                  enrolmentId: row.id,
                  studentId: row.student_id,
                  studentName: p.full_name || 'Student',
                  studentEmail: p.email || 'student@globeskill.org',
                  courseId: t.id,
                  courseTitle: t.title,
                  partner: t.partner_organization,
                  status: row.status as EnrolmentStatus,
                  progress: row.progress_percentage || 0,
                  enrolledAt: row.enrolled_at,
                  completedAt: row.completed_at,
                  certificateUrl: row.certificate_url,
                };
              });

            if (mapped.length > 0) {
              setStudents(mapped);
            }
          }
        }
      } catch (err) {
        console.warn('Using mock trainer data:', err);
      }
    }

    loadTrainerData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Handle Instant Status Update
  const handleStatusChange = async (enrolmentId: string, newStatus: EnrolmentStatus) => {
    setUpdatingId(enrolmentId);

    // Find student for toast feedback
    const student = students.find((s) => s.enrolmentId === enrolmentId);
    const targetProgress = newStatus === 'completed' ? 100 : newStatus === 'enrolled' ? 0 : student?.progress || 50;

    // 1. Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => {
        if (s.enrolmentId === enrolmentId) {
          return {
            ...s,
            status: newStatus,
            progress: targetProgress,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
          };
        }
        return s;
      })
    );

    try {
      // 2. Client-side fetch to secure API route
      const res = await fetch('/api/trainer/enrolment', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrolmentId,
          status: newStatus,
          progress: targetProgress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update student enrolment status.');
      }

      setToastMessage(
        `✓ Updated ${student?.studentName || 'Student'}'s status to "${STATUS_CONFIG[newStatus].label}" (${targetProgress}% complete).`
      );

      setTimeout(() => {
        setToastMessage(null);
      }, 4500);
    } catch (err) {
      console.error('Status update error:', err);
      setToastMessage(err instanceof Error ? err.message : 'Failed to update database.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics calculation
  const totalCount = students.length;
  const inProgressCount = students.filter((s) => s.status === 'in_progress').length;
  const graduatedCount = students.filter((s) => s.status === 'completed').length;
  const avgProgress = totalCount > 0 ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / totalCount) : 0;

  // Managed Courses list for filter dropdown
  const uniqueCourses = Array.from(new Set(students.map((s) => s.courseTitle)));

  // Filtered students list
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse =
      selectedCourseFilter === 'All' || s.courseTitle === selectedCourseFilter;

    const matchesStatus =
      selectedStatusFilter === 'All' || s.status === selectedStatusFilter;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-emerald-500/60 shadow-2xl flex items-center space-x-3 max-w-md animate-slide-up"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            ✓
          </div>
          <p className="text-xs sm:text-sm font-medium">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs cursor-pointer ml-auto"
          >
            &times;
          </button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 1. TRAINER HEADER & COHORT PERFORMANCE OVERVIEW */}
      {/* ======================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 border border-blue-900/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/30 text-xs font-semibold text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Trainer Supervision Console</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="text-blue-400">{trainerName}</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Monitor active learner cohorts, review skill milestones, and manage completion records for your assigned curriculums.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Supervised
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{totalCount}</span>
              <span className="text-xs text-blue-400 font-medium">Students</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Learners
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">{inProgressCount}</span>
              <span className="text-xs text-slate-400">In-Progress</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Graduated Cohort
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{graduatedCount}</span>
              <span className="text-xs text-emerald-300 font-medium">Certified</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Average Progress
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{avgProgress}%</span>
              <span className="text-xs text-slate-400">Completion</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. SEARCH & FILTER TOOLBAR */}
      {/* ======================================================================= */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name or email..."
              className="block w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Course Track Selector */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Course:</span>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="All">All Managed Tracks ({uniqueCourses.length})</option>
                {uniqueCourses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="All">All Statuses</option>
                <option value="enrolled">Not Started</option>
                <option value="in_progress">In-Progress</option>
                <option value="completed">Graduated</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. STUDENT ROSTER TABLE WITH INSTANT STATUS DROPDOWNS */}
      {/* ======================================================================= */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Assigned Student Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant database updates are triggered upon status selection.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Showing {filteredStudents.length} of {students.length} Learners
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl">
              🔍
            </div>
            <p className="text-sm font-semibold text-slate-700">No students match your filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCourseFilter('All');
                setSelectedStatusFilter('All');
              }}
              className="text-xs text-blue-700 font-bold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-5">Course Track</th>
                  <th className="py-3.5 px-5">Progress</th>
                  <th className="py-3.5 px-5">Enrolled Date</th>
                  <th className="py-3.5 px-5 min-w-[190px]">Status (Instant Update)</th>
                  <th className="py-3.5 px-5 text-right">Credential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((row) => {
                  const cfg = STATUS_CONFIG[row.status];
                  const isUpdating = updatingId === row.enrolmentId;

                  return (
                    <tr
                      key={row.enrolmentId}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Student Column */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-blue-200">
                            {row.studentName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {row.studentName}
                            </span>
                            <span className="text-xs text-slate-400 block truncate">
                              {row.studentEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course Track */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-slate-900 block">
                          {row.courseTitle}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 block">
                          {row.partner}
                        </span>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-4 px-5">
                        <div className="w-32 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-600">{row.progress}%</span>
                            {row.status === 'completed' && (
                              <span className="text-emerald-700 text-[10px]">Graduated</span>
                            )}
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                row.status === 'completed' ? 'bg-emerald-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${row.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Date */}
                      <td className="py-4 px-5 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {new Date(row.enrolledAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status Dropdown (Direct DB Mutation) */}
                      <td className="py-4 px-5">
                        <div className="relative inline-flex items-center">
                          <select
                            id={`status-select-${row.enrolmentId}`}
                            value={row.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStatusChange(row.enrolmentId, e.target.value as EnrolmentStatus)
                            }
                            className={`py-1.5 pl-3 pr-8 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <option value="enrolled">🟡 Not Started</option>
                            <option value="in_progress">🔵 In-Progress</option>
                            <option value="completed">🟢 Graduated</option>
                            <option value="dropped">⚪ Dropped</option>
                          </select>

                          {isUpdating && (
                            <div className="absolute right-2 pointer-events-none">
                              <svg
                                className="w-3.5 h-3.5 animate-spin text-blue-600"
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
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Credential Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {row.status === 'completed' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span>★</span>
                            <span>Verified</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(row.enrolmentId, 'completed')}
                            className="text-xs text-blue-700 hover:text-blue-900 font-semibold hover:underline cursor-pointer"
                          >
                            Mark Graduated &rarr;
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
