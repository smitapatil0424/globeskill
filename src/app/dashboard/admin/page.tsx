'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EnrolmentStatus, Sdg4Metrics, Sdg8Metrics, Sdg9Metrics } from '@/types/database';
import DonorContributionLedger from '@/components/DonorContributionLedger';

export interface AdminStudentRow {
  enrolmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  partner: string;
  category: string;
  trainerId: string;
  trainerName: string;
  trainerEmail: string;
  status: EnrolmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt?: string | null;
  certificateUrl?: string | null;
}

export interface AdminDashboardStats {
  totalStudents: number;
  activeProjects: number;
  activeTrainers: number;
  totalDonationFundsINR: number;
}

// Fallback Mock Data based on GlobeSkill seed schema
const DEFAULT_STATS: AdminDashboardStats = {
  totalStudents: 148,
  activeProjects: 6,
  activeTrainers: 4,
  totalDonationFundsINR: 4825000, // ₹48,25,000 INR
};

const DEFAULT_ADMIN_STUDENTS: AdminStudentRow[] = [
  {
    enrolmentId: 'e0000000-0000-0000-0000-000000000001',
    studentId: 'd0000000-0000-0000-0000-000000000003',
    studentName: 'Liam Chen',
    studentEmail: 'liam.chen@student.globeskill.org',
    courseId: 'c0000000-0000-0000-0000-000000000001',
    courseTitle: 'IBM SkillsBuild - Frontend Development',
    partner: 'IBM SkillsBuild',
    category: 'Web Development',
    trainerId: 'd0000000-0000-0000-0000-000000000002',
    trainerName: 'Maya Patel',
    trainerEmail: 'maya.patel@globeskill.org',
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
    category: 'Artificial Intelligence',
    trainerId: 'd0000000-0000-0000-0000-000000000001',
    trainerName: 'Dr. Aris Thorne',
    trainerEmail: 'aris.thorne@globeskill.org',
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
    category: 'Cloud Engineering',
    trainerId: 'd0000000-0000-0000-0000-000000000002',
    trainerName: 'Maya Patel',
    trainerEmail: 'maya.patel@globeskill.org',
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
    category: 'Web Development',
    trainerId: 'd0000000-0000-0000-0000-000000000002',
    trainerName: 'Maya Patel',
    trainerEmail: 'maya.patel@globeskill.org',
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
    category: 'Artificial Intelligence',
    trainerId: 'd0000000-0000-0000-0000-000000000001',
    trainerName: 'Dr. Aris Thorne',
    trainerEmail: 'aris.thorne@globeskill.org',
    status: 'enrolled',
    progress: 0,
    enrolledAt: '2026-08-24T08:00:00Z',
  },
  {
    enrolmentId: 'e0000000-0000-0000-0000-000000000006',
    studentId: 'd0000000-0000-0000-0000-000000000009',
    studentName: 'Ananya Sharma',
    studentEmail: 'ananya.sharma@student.globeskill.org',
    courseId: 'c0000000-0000-0000-0000-000000000004',
    courseTitle: 'Data Science with Python & BigQuery',
    partner: 'Google Career Certificates',
    category: 'Data Science',
    trainerId: 'd0000000-0000-0000-0000-000000000001',
    trainerName: 'Dr. Aris Thorne',
    trainerEmail: 'aris.thorne@globeskill.org',
    status: 'in_progress',
    progress: 60,
    enrolledAt: '2026-08-18T13:00:00Z',
  },
];

const STATUS_PILLS: Record<EnrolmentStatus, { label: string; bg: string; text: string; border: string }> = {
  enrolled: {
    label: 'Not Started',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  in_progress: {
    label: 'In-Progress',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  completed: {
    label: 'Graduated',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  dropped: {
    label: 'Dropped',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
};

/**
 * Format numbers in Indian Rupees (INR) format: e.g. ₹48,25,000
 */
function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function NGOAdminDashboardPage() {
  const supabase = createClient();

  const [stats, setStats] = useState<AdminDashboardStats>(DEFAULT_STATS);
  const [students, setStudents] = useState<AdminStudentRow[]>(DEFAULT_ADMIN_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [trainerFilter, setTrainerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudentModal, setSelectedStudentModal] = useState<AdminStudentRow | null>(null);

  // UN Sustainable Development Goals (SDG) Metrics State
  const [sdgMetrics, setSdgMetrics] = useState<{
    sdg4: Sdg4Metrics;
    sdg8: Sdg8Metrics;
    sdg9: Sdg9Metrics[];
  } | null>(null);

  // Form State for Adding New Training Program
  const [isNewProgramModalOpen, setIsNewProgramModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    duration_weeks: 8,
    partner_organization: 'IBM SkillsBuild',
    difficulty_level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    max_capacity: 50,
    trainer_id: 'd0000000-0000-0000-0000-000000000001',
    status: 'active' as 'active' | 'draft',
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errors.title = 'Program title is required (min 3 characters).';
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = 'Program description is required (min 10 characters).';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required.';
    }
    const weeks = Number(formData.duration_weeks);
    if (!weeks || isNaN(weeks) || weeks <= 0) {
      errors.duration_weeks = 'Duration must be a positive number of weeks.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.error || 'Failed to create training program.');
      }

      setStats((prev) => ({
        ...prev,
        activeProjects: formData.status === 'active' ? prev.activeProjects + 1 : prev.activeProjects,
      }));

      setToastMessage(`🎉 Training program "${formData.title}" created successfully!`);
      setIsNewProgramModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Web Development',
        duration_weeks: 8,
        partner_organization: 'IBM SkillsBuild',
        difficulty_level: 'Beginner',
        max_capacity: 50,
        trainer_id: 'd0000000-0000-0000-0000-000000000001',
        status: 'active',
      });
      setFormErrors({});

      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Program creation error:', err);
      setToastMessage(err instanceof Error ? err.message : 'Error creating program.');
      setTimeout(() => setToastMessage(null), 4500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // State & Handler for LMS Synchronization with IBM SkillsBuild
  const [isSyncingLMS, setIsSyncingLMS] = useState(false);
  const [syncModalData, setSyncModalData] = useState<{
    inserted: number;
    updated: number;
    totalFetched: number;
    logs: string[];
  } | null>(null);

  const handleSyncLMS = async () => {
    setIsSyncingLMS(true);
    try {
      const res = await fetch('/api/admin/sync-lms', { method: 'POST' });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to complete LMS synchronization.');
      }

      const syncData = json.data;
      setSyncModalData({
        inserted: syncData.inserted,
        updated: syncData.updated,
        totalFetched: syncData.totalFetched,
        logs: syncData.logs,
      });

      if (syncData.inserted > 0) {
        setStats((prev) => ({
          ...prev,
          activeProjects: prev.activeProjects + syncData.inserted,
        }));
      }

      setToastMessage(`✓ IBM SkillsBuild Sync Complete: ${syncData.inserted} new, ${syncData.updated} updated.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('LMS sync error:', err);
      setToastMessage(err instanceof Error ? err.message : 'Error syncing with IBM SkillsBuild.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSyncingLMS(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      try {
        // 1. Fetch Students count
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'Student');

        // 2. Fetch Active Training Projects count
        const { count: projectCount } = await supabase
          .from('training_projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // 3. Fetch Active Trainers count
        const { count: trainerCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'Trainer');

        // 4. Fetch Donations sum (calculate INR equivalent)
        const { data: donations } = await supabase
          .from('donations')
          .select('amount, currency')
          .eq('payment_status', 'succeeded');

        let totalINR = 4825000;
        if (donations && donations.length > 0) {
          totalINR = donations.reduce((sum, d) => {
            const amt = Number(d.amount) || 0;
            // If currency is USD, convert at ~83 INR/USD
            return sum + (d.currency === 'USD' ? amt * 83 : amt);
          }, 0);
        }

        if (isMounted) {
          setStats({
            totalStudents: studentCount ?? DEFAULT_STATS.totalStudents,
            activeProjects: projectCount ?? DEFAULT_STATS.activeProjects,
            activeTrainers: trainerCount ?? DEFAULT_STATS.activeTrainers,
            totalDonationFundsINR: totalINR,
          });
        }

        // 5. Fetch Enrolments joined with student profile, course, and trainer
        const { data: enrolmentsData } = await supabase
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
              category,
              trainer_id,
              trainer:trainer_id (
                id,
                full_name,
                email
              )
            )
          `);

        if (enrolmentsData && enrolmentsData.length > 0 && isMounted) {
          const mapped: AdminStudentRow[] = enrolmentsData
            .filter((row) => row.profiles && row.training_projects)
            .map((row) => {
              const p = row.profiles as unknown as { full_name: string; email: string };
              const t = row.training_projects as unknown as {
                id: string;
                title: string;
                partner_organization: string;
                category: string;
                trainer_id: string;
                trainer?: { id: string; full_name: string; email: string };
              };

              return {
                enrolmentId: row.id,
                studentId: row.student_id,
                studentName: p.full_name || 'Student',
                studentEmail: p.email || 'student@globeskill.org',
                courseId: t.id,
                courseTitle: t.title,
                partner: t.partner_organization || 'GlobeSkill Partner',
                category: t.category || 'Technology',
                trainerId: t.trainer_id,
                trainerName: t.trainer?.full_name || 'Dr. Aris Thorne',
                trainerEmail: t.trainer?.email || 'trainer@globeskill.org',
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

        // 6. Fetch UN SDG 4, 8, and 9 Metrics
        try {
          const sdgRes = await fetch('/api/admin/sdg-metrics');
          if (sdgRes.ok) {
            const sdgJson = await sdgRes.json();
            if (sdgJson.success && isMounted) {
              setSdgMetrics({
                sdg4: sdgJson.sdg4,
                sdg8: sdgJson.sdg8,
                sdg9: sdgJson.sdg9,
              });
            }
          }
        } catch (sdgErr) {
          console.warn('SDG metrics fetch error:', sdgErr);
        }
      } catch (err) {
        console.warn('Using mock admin dataset:', err);
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Extract unique courses and trainers for dropdown filters
  const uniqueCourses = Array.from(new Set(students.map((s) => s.courseTitle)));
  const uniqueTrainers = Array.from(new Set(students.map((s) => s.trainerName)));

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.studentName.toLowerCase().includes(q) ||
      s.studentEmail.toLowerCase().includes(q) ||
      s.courseTitle.toLowerCase().includes(q) ||
      s.trainerName.toLowerCase().includes(q);

    const matchesCourse = courseFilter === 'All' || s.courseTitle === courseFilter;
    const matchesTrainer = trainerFilter === 'All' || s.trainerName === trainerFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesCourse && matchesTrainer && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ======================================================================= */}
      {/* 1. EXECUTIVE BANNER */}
      {/* ======================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>NGO Operations & Governance Console</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              NGO Administrative Dashboard
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Real-time platform supervision, cross-cohort performance analytics, and donor funding oversight.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/test"
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <span>⚙ Diagnostics</span>
            </a>
            <button
              id="sync-lms-btn"
              disabled={isSyncingLMS}
              onClick={handleSyncLMS}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              <span>{isSyncingLMS ? 'Syncing...' : 'Sync IBM SkillsBuild 🔄'}</span>
            </button>
            <button
              id="add-training-program-btn"
              onClick={() => setIsNewProgramModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>+ Add Training Program</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. HIGH-LEVEL STATS GRID (4 REQUIRED CARDS) */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Enrolled Students */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Enrolled Students
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
              👥
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalStudents.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              +18% MoM
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Active learners across all IBM & AI tracks
          </p>
        </div>

        {/* Stat 2: Active Training Projects */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Training Projects
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">
              📚
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.activeProjects}
            </span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Live Tracks
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Frontend, AI, Cloud & Data Engineering
          </p>
        </div>

        {/* Stat 3: Active Trainers */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Trainers
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
              🎓
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.activeTrainers}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Certified
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Dedicated industry mentors leading cohorts
          </p>
        </div>

        {/* Stat 4: Total Donation Funds (formatted in Indian Rupees INR) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Donation Funds
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">
              ₹
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {formatINR(stats.totalDonationFundsINR)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>INR Capital Pool &bull; 92% Budget Target</span>
          </p>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2.5 UN SUSTAINABLE DEVELOPMENT GOALS (SDG) IMPACT & REGIONAL HUBS */}
      {/* ======================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wide">
                UN Global Compact
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                UN Sustainable Development Goals (SDG) Impact Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time indicators tracking Quality Education (SDG 4), Decent Work (SDG 8), and Regional Tier 2/3 Innovation Infrastructure (SDG 9).
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Aggregated via PostgreSQL Views: <code className="text-indigo-600 font-mono">sdg_4_metrics</code>, <code className="text-indigo-600 font-mono">sdg_8_metrics</code>, <code className="text-indigo-600 font-mono">sdg_9_metrics</code>
          </span>
        </div>

        {/* SDG 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SDG 4 CARD: Quality Education */}
          <div className="p-6 rounded-3xl bg-white border border-rose-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-md bg-[#C5192D] text-white flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <span className="text-xs font-bold text-[#C5192D] uppercase tracking-wide">
                    SDG 4: Quality Education
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold">
                  Lifelong Learning
                </span>
              </div>

              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {sdgMetrics?.sdg4.total_learners_trained ?? 148}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-2">
                  Learners Trained
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-rose-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Digital Courses Completed:</span>
                  <span className="font-bold text-slate-900">{sdgMetrics?.sdg4.digital_courses_completed ?? 84}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Average Assessment Score:</span>
                  <span className="font-bold text-emerald-600">{sdgMetrics?.sdg4.avg_assessment_score_percentage ?? 84.5}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Overall Completion Rate:</span>
                  <span className="font-bold text-indigo-600">{sdgMetrics?.sdg4.overall_completion_rate_percentage ?? 78.4}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{sdgMetrics?.sdg4.total_training_weeks_completed ?? 672} Training Weeks</span>
              <span className="text-rose-600 font-medium">Inclusive Curriculums &bull; Target 4.4</span>
            </div>
          </div>

          {/* SDG 8 CARD: Decent Work & Economic Growth */}
          <div className="p-6 rounded-3xl bg-white border border-red-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-md bg-[#A21942] text-white flex items-center justify-center font-bold text-xs">
                    8
                  </span>
                  <span className="text-xs font-bold text-[#A21942] uppercase tracking-wide">
                    SDG 8: Decent Work
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold">
                  Youth Employment
                </span>
              </div>

              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {sdgMetrics?.sdg8.graduated_youth_count ?? 84}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-2">
                  Youth Graduated
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-red-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Employment-Ready Candidates:</span>
                  <span className="font-bold text-slate-900">{sdgMetrics?.sdg8.employment_ready_candidates ?? 76}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>High-Growth Tech Tracks:</span>
                  <span className="font-bold text-purple-600">{sdgMetrics?.sdg8.high_growth_tech_graduates ?? 62}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Youth Economic Readiness:</span>
                  <span className="font-bold text-emerald-600">{sdgMetrics?.sdg8.youth_economic_readiness_index ?? 90.5}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{sdgMetrics?.sdg8.active_industry_mentors ?? 4} Industry Mentors</span>
              <span className="text-[#A21942] font-medium">Productive Employment &bull; Target 8.6</span>
            </div>
          </div>

          {/* SDG 9 CARD: Industry & Innovation */}
          <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-md bg-[#F58220] text-white flex items-center justify-center font-bold text-xs">
                    9
                  </span>
                  <span className="text-xs font-bold text-[#F58220] uppercase tracking-wide">
                    SDG 9: Regional Hubs
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold">
                  Tier 2/3 Infrastructure
                </span>
              </div>

              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  {sdgMetrics?.sdg9.length ?? 5}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-2">
                  Regional Skilling Centers
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-amber-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tier 3 Rural Centers:</span>
                  <span className="font-bold text-slate-900">3 Rural Districts</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Average Hub Utilization:</span>
                  <span className="font-bold text-indigo-600">72.6% Workstation Cap</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Innovation Credentials:</span>
                  <span className="font-bold text-emerald-600">62 Cloud & AI Tracks</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Broadband Enabled</span>
              <span className="text-[#F58220] font-medium">Digital Access &bull; Target 9.c</span>
            </div>
          </div>
        </div>

        {/* SDG 9 Regional Tier 2 & Tier 3 Hub Distribution Table */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <span>📍</span>
              <span>Geographic Distribution Across Regional Tier 2 & Tier 3 Hubs (SDG 9.c)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Real-time infrastructure capacity and local cohort metrics
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Regional Hub</th>
                  <th className="py-2.5 px-3">Location & Tier</th>
                  <th className="py-2.5 px-3">Broadband Link</th>
                  <th className="py-2.5 px-3 text-center">Learners</th>
                  <th className="py-2.5 px-3 text-center">Graduated</th>
                  <th className="py-2.5 px-3 text-right">Workstation Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(sdgMetrics?.sdg9 ?? [
                  {
                    hub_id: '1',
                    hub_name: 'Jaipur Innovation Center',
                    location_city: 'Jaipur',
                    state_region: 'Rajasthan',
                    hub_tier: 'Tier 2 Emerging City',
                    broadband_connectivity: 'Optical Fiber Gigabit',
                    registered_learners: 42,
                    hub_graduated_count: 24,
                    hub_workstation_utilization_percentage: 77.3,
                  },
                  {
                    hub_id: '2',
                    hub_name: 'Coimbatore Skills Academy',
                    location_city: 'Coimbatore',
                    state_region: 'Tamil Nadu',
                    hub_tier: 'Tier 2 Emerging City',
                    broadband_connectivity: 'Dedicated Leased Line',
                    registered_learners: 36,
                    hub_graduated_count: 21,
                    hub_workstation_utilization_percentage: 73.8,
                  },
                  {
                    hub_id: '3',
                    hub_name: 'Vidarbha Rural Learning Hub',
                    location_city: 'Amravati',
                    state_region: 'Maharashtra',
                    hub_tier: 'Tier 3 Rural District',
                    broadband_connectivity: 'Satellite & 5G Wireless',
                    registered_learners: 28,
                    hub_graduated_count: 14,
                    hub_workstation_utilization_percentage: 80.0,
                  },
                  {
                    hub_id: '4',
                    hub_name: 'Dharwad Vocational Tech Institute',
                    location_city: 'Dharwad',
                    state_region: 'Karnataka',
                    hub_tier: 'Tier 3 Rural District',
                    broadband_connectivity: 'Rural Fiber Network',
                    registered_learners: 24,
                    hub_graduated_count: 13,
                    hub_workstation_utilization_percentage: 60.0,
                  },
                  {
                    hub_id: '5',
                    hub_name: 'Sundarbans Community Skilling Lab',
                    location_city: 'Gosaba',
                    state_region: 'West Bengal',
                    hub_tier: 'Tier 3 Rural District',
                    broadband_connectivity: 'Solar-Powered VSAT & 4G',
                    registered_learners: 18,
                    hub_graduated_count: 12,
                    hub_workstation_utilization_percentage: 72.0,
                  },
                ]).map((hub) => (
                  <tr key={hub.hub_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {hub.hub_name}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">
                        {hub.location_city}, {hub.state_region}
                      </div>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                        hub.hub_tier.includes('Tier 3')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {hub.hub_tier}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {hub.broadband_connectivity}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {hub.registered_learners}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {hub.hub_graduated_count}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-semibold text-slate-700">
                        {hub.hub_workstation_utilization_percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2.75 DONOR CONTRIBUTIONS & CAPITAL ALLOCATION LEDGER */}
      {/* ======================================================================= */}
      <DonorContributionLedger />

      {/* ======================================================================= */}
      {/* 3. SEARCH & FILTER TOOLBAR */}
      {/* ======================================================================= */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, trainer, or course..."
              className="block w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-colors"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Course Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Course:</span>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="All">All Courses ({uniqueCourses.length})</option>
                {uniqueCourses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Trainer Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Trainer:</span>
              <select
                value={trainerFilter}
                onChange={(e) => setTrainerFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="All">All Trainers ({uniqueTrainers.length})</option>
                {uniqueTrainers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
      {/* 4. TABULAR VIEW: REGISTERED STUDENTS, ASSIGNED TRAINERS & COURSES */}
      {/* ======================================================================= */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Registered Students & Supervised Curriculums
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive roster linking students, assigned mentors, and track completion progress.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Showing {filteredStudents.length} of {students.length} Records
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl">
              🔍
            </div>
            <p className="text-sm font-semibold text-slate-700">No matching student enrolments found.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCourseFilter('All');
                setTrainerFilter('All');
                setStatusFilter('All');
              }}
              className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Registered Student</th>
                  <th className="py-3.5 px-5">Enrolled Course</th>
                  <th className="py-3.5 px-5">Assigned Trainer</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Progress</th>
                  <th className="py-3.5 px-5">Enrolled Date</th>
                  <th className="py-3.5 px-5 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((row) => {
                  const pill = STATUS_PILLS[row.status];

                  return (
                    <tr
                      key={row.enrolmentId}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Registered Student */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-indigo-200">
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

                      {/* Enrolled Course */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-slate-900 block">
                          {row.courseTitle}
                        </span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[11px] font-medium text-indigo-600">
                            {row.partner}
                          </span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-[11px] text-slate-500">
                            {row.category}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Trainer */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0 border border-emerald-200">
                            {row.trainerName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-slate-900 block text-xs">
                              {row.trainerName}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {row.trainerEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${pill.bg} ${pill.text} ${pill.border}`}
                        >
                          {pill.label}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-4 px-5">
                        <div className="w-28 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                            <span>{row.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                row.status === 'completed'
                                  ? 'bg-emerald-500'
                                  : 'bg-indigo-600'
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

                      {/* Audit Details */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentModal(row)}
                          className="text-xs text-indigo-600 hover:text-indigo-900 font-bold hover:underline cursor-pointer"
                        >
                          Audit Details &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 5. AUDIT DETAILS MODAL */}
      {/* ======================================================================= */}
      {selectedStudentModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-scale-up">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Enrolment Audit Log
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2.5">
                  {selectedStudentModal.studentName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedStudentModal.studentEmail}</p>
              </div>
              <button
                onClick={() => setSelectedStudentModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-base font-bold transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Enrolled Course</span>
                <strong className="text-slate-900 block mt-1 text-sm font-bold">{selectedStudentModal.courseTitle}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Accredited Partner</span>
                <strong className="text-slate-900 block mt-1 text-sm font-bold">{selectedStudentModal.partner}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Assigned Mentor</span>
                <strong className="text-slate-900 block mt-1 text-sm font-bold">{selectedStudentModal.trainerName}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Current Progress</span>
                <strong className="text-slate-900 block mt-1 text-sm font-bold">{selectedStudentModal.progress}% ({selectedStudentModal.status})</strong>
              </div>
            </div>

            {selectedStudentModal.certificateUrl && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="text-emerald-800 font-bold block text-sm">✓ Verified Credential Issued</span>
                <a
                  href={selectedStudentModal.certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 underline text-xs mt-1 block truncate font-medium"
                >
                  {selectedStudentModal.certificateUrl}
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentModal(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 6. ADD NEW TRAINING PROGRAM MODAL (PREMIUM SPACIOUS ENTERPRISE FORM) */}
      {/* ======================================================================= */}
      {isNewProgramModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-scale-up">
            <div className="flex items-start justify-between border-b border-slate-100 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Curriculum Management</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
                  Create New Training Program
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure a new technology skilling track, assign an accredited partner, and allocate cohort mentors.
                </p>
              </div>
              <button
                onClick={() => setIsNewProgramModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4 pt-5 text-xs sm:text-sm">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="program-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Program Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="program-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                    }}
                    placeholder="e.g. Full-Stack Web Development with React"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-xs sm:text-sm shadow-xs ${
                      formErrors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="program-category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Track Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="program-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-xs sm:text-sm shadow-xs cursor-pointer"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Artificial Intelligence">Artificial Intelligence & ML</option>
                    <option value="Cloud Engineering">Cloud Engineering & DevOps</option>
                    <option value="Data Science">Data Science & Analytics</option>
                    <option value="Cybersecurity">Cybersecurity & IT Operations</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Partner & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="program-partner" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Accredited Partner
                  </label>
                  <input
                    id="program-partner"
                    type="text"
                    value={formData.partner_organization}
                    onChange={(e) => setFormData({ ...formData, partner_organization: e.target.value })}
                    placeholder="e.g. IBM SkillsBuild, Google, Infosys"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-xs sm:text-sm shadow-xs"
                  />
                </div>

                <div>
                  <label htmlFor="program-duration" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Duration (in Weeks) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="program-duration"
                    type="number"
                    min="1"
                    max="52"
                    required
                    value={formData.duration_weeks}
                    onChange={(e) => {
                      setFormData({ ...formData, duration_weeks: Number(e.target.value) });
                      if (formErrors.duration_weeks) setFormErrors({ ...formErrors, duration_weeks: '' });
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-xs sm:text-sm shadow-xs ${
                      formErrors.duration_weeks ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.duration_weeks && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.duration_weeks}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Difficulty, Capacity & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="program-difficulty" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    id="program-difficulty"
                    value={formData.difficulty_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty_level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-xs sm:text-sm shadow-xs cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="program-capacity" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Max Student Capacity
                  </label>
                  <input
                    id="program-capacity"
                    type="number"
                    min="5"
                    max="500"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-xs sm:text-sm shadow-xs"
                  />
                </div>

                <div>
                  <label htmlFor="program-status" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Status
                  </label>
                  <select
                    id="program-status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'draft' })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-xs sm:text-sm shadow-xs cursor-pointer"
                  >
                    <option value="active">Active (Open for Enrolment)</option>
                    <option value="draft">Draft (Planning)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Description */}
              <div>
                <label htmlFor="program-description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Program Description & Objectives <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="program-description"
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  placeholder="Outline the curriculum prerequisites, learning modules, and career skills..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-xs sm:text-sm shadow-xs resize-none ${
                    formErrors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.description}</p>
                )}
              </div>

              {/* Modal Actions - Separated Cancel on Left, Submit on Right */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsNewProgramModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Cancel
                </button>
                <button
                  id="submit-program-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/20 hover:shadow-emerald-900/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 active:scale-95 ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Creating Program...</span>
                    </>
                  ) : (
                    <span>Create Training Program &rarr;</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 7. LMS SYNCHRONIZATION EXECUTION & LOG TRACE MODAL */}
      {/* ======================================================================= */}
      {syncModalData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-up">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">
                  <span>✓ LMS Sync Execution Report</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  IBM SkillsBuild Curriculum Sync
                </h3>
                <p className="text-xs text-slate-500">
                  External course catalog ingestion and schema mapping results.
                </p>
              </div>
              <button
                onClick={() => setSyncModalData(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Sync Summary Counters */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                  Fetched
                </span>
                <span className="text-2xl font-extrabold text-blue-900">{syncModalData.totalFetched}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                  Inserted
                </span>
                <span className="text-2xl font-extrabold text-emerald-900">{syncModalData.inserted}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">
                  Updated
                </span>
                <span className="text-2xl font-extrabold text-purple-900">{syncModalData.updated}</span>
              </div>
            </div>

            {/* Detailed Log Console */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">Execution & Tracing Logs</span>
              <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] h-52 overflow-y-auto space-y-1.5 border border-slate-800">
                {syncModalData.logs.map((line, idx) => {
                  const isSuccess = line.includes('[SUCCESS]');
                  const isWarn = line.includes('[WARN]');
                  const isError = line.includes('[ERROR]');

                  return (
                    <div
                      key={idx}
                      className={`leading-relaxed break-all ${
                        isSuccess
                          ? 'text-emerald-400 font-semibold'
                          : isWarn
                          ? 'text-amber-400'
                          : isError
                          ? 'text-rose-400 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSyncModalData(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl text-white shadow-2xl flex items-center gap-3 max-w-md animate-slide-up ${
            toastMessage.toLowerCase().includes('failed') || toastMessage.toLowerCase().includes('error')
              ? 'bg-red-950 border border-red-500/70 text-red-100'
              : 'bg-slate-900 border border-emerald-500/60'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 ${
              toastMessage.toLowerCase().includes('failed') || toastMessage.toLowerCase().includes('error')
                ? 'bg-red-600'
                : 'bg-emerald-500'
            }`}
          >
            {toastMessage.toLowerCase().includes('failed') || toastMessage.toLowerCase().includes('error') ? '✕' : '✓'}
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
    </div>
  );
}
