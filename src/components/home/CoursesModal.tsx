'use client';

import React from 'react';
import Link from 'next/link';

interface CoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COURSES = [
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'AI Micro Degree for Young Innovators',
    category: 'Artificial Intelligence & Data',
    partner: 'GlobeSkill AI Academy',
    duration: '12 Weeks',
    badge: 'Flagship',
    description:
      'Master prompt engineering, deep learning foundations, ethical AI safety, and build production LLM apps.',
    link: '/dashboard/student/quiz',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'IBM SkillsBuild - Frontend Development',
    category: 'Web & Software Engineering',
    partner: 'IBM SkillsBuild',
    duration: '8 Weeks',
    badge: 'Co-Branded',
    description:
      'Industry standard modern frontend development with React, TypeScript, accessible UI, and Next.js.',
    link: '/signup',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'AI & Data Careers for Women',
    category: 'Diversity in Tech Initiative',
    partner: 'TechPower Foundation',
    duration: '10 Weeks',
    badge: '100% Scholarship',
    description:
      'Targeted cohort for women entering high-growth roles in machine learning, data engineering, and tech leadership.',
    link: '/signup',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Full-Stack Web & Creative Coding',
    category: 'Applied Engineering',
    partner: 'GlobeSkill Open Lab',
    duration: '14 Weeks',
    badge: 'Hands-on',
    description:
      'Comprehensive full-stack architecture with Supabase RLS, RESTful APIs, modern databases, and server deployment.',
    link: '/signup',
  },
];

export default function CoursesModal({ isOpen, onClose }: CoursesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              🧭
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Featured Learning Tracks &amp; Courses</h3>
              <p className="text-xs text-slate-500">Industry-aligned curricula with verified certifications</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Course List */}
        <div className="p-6 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
          {COURSES.map((course) => (
            <div key={course.id} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {course.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{course.partner} • {course.duration}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2">{course.description}</p>
              </div>
              <Link
                href={course.link}
                onClick={onClose}
                className="shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                Enroll Free &rarr;
              </Link>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>All courses are 100% free for underserved youth.</span>
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-slate-700 hover:text-slate-900 px-3 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
