import { NextResponse } from 'next/server';
import { UserRole } from '@/types/database';

export interface RoutePermissionTest {
  path: string;
  expectedStatus: 'ALLOW' | 'REDIRECT_LOGIN' | 'REDIRECT_UNAUTHORIZED' | 'REDIRECT_HOME';
  description: string;
}

export interface RoleEvaluation {
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

export async function GET() {
  const roles: RoleEvaluation[] = [
    {
      role: 'NGO Administrator',
      displayName: 'NGO Administrator',
      badgeColor: 'purple',
      canAccessAdmin: true,
      canAccessDashboard: true,
      tableAccess: {
        profiles: 'Full Access (SELECT, INSERT, UPDATE, DELETE)',
        training_projects: 'Full Management (Create & publish courses, assign trainers)',
        student_enrolments: 'Full Supervision (Audit progress, certify completions)',
        donations: 'Full Financial Audit (View all donor records & transactions)',
      },
      routeMatrix: {
        '/admin': {
          path: '/admin',
          expectedStatus: 'ALLOW',
          description: 'Full access to Admin Console and cohort metrics',
        },
        '/dashboard': {
          path: '/dashboard',
          expectedStatus: 'ALLOW',
          description: 'Access to general platform workspace',
        },
        '/login': {
          path: '/login',
          expectedStatus: 'REDIRECT_HOME',
          description: 'Active session redirects back to homepage',
        },
        '/signup': {
          path: '/signup',
          expectedStatus: 'REDIRECT_HOME',
          description: 'Active session redirects back to homepage',
        },
      },
    },
    {
      role: 'Trainer',
      displayName: 'Trainer',
      badgeColor: 'blue',
      canAccessAdmin: false,
      canAccessDashboard: true,
      tableAccess: {
        profiles: 'View own profile & update bio/contact info',
        training_projects: 'View assigned courses and student rosters',
        student_enrolments: 'View & update progress for students in their assigned tracks',
        donations: 'No direct access (RLS restricted)',
      },
      routeMatrix: {
        '/admin': {
          path: '/admin',
          expectedStatus: 'REDIRECT_UNAUTHORIZED',
          description: 'Blocked by RBAC middleware -> redirects to /unauthorized (403)',
        },
        '/dashboard': {
          path: '/dashboard',
          expectedStatus: 'ALLOW',
          description: 'Access to trainer dashboard and student evaluations',
        },
        '/login': {
          path: '/login',
          expectedStatus: 'REDIRECT_HOME',
          description: 'Active session redirects back to homepage',
        },
      },
    },
    {
      role: 'Student',
      displayName: 'Student',
      badgeColor: 'emerald',
      canAccessAdmin: false,
      canAccessDashboard: true,
      tableAccess: {
        profiles: 'View and edit own learner profile',
        training_projects: 'Browse all active courses (IBM SkillsBuild tracks)',
        student_enrolments: 'View own course progress & self-enrol in new tracks',
        donations: 'No direct access (RLS restricted)',
      },
      routeMatrix: {
        '/admin': {
          path: '/admin',
          expectedStatus: 'REDIRECT_UNAUTHORIZED',
          description: 'Blocked by RBAC middleware -> redirects to /unauthorized (403)',
        },
        '/dashboard': {
          path: '/dashboard',
          expectedStatus: 'ALLOW',
          description: 'Access to student course dashboard and learning modules',
        },
        '/login': {
          path: '/login',
          expectedStatus: 'REDIRECT_HOME',
          description: 'Active session redirects back to homepage',
        },
      },
    },
    {
      role: 'Volunteer',
      displayName: 'Volunteer',
      badgeColor: 'amber',
      canAccessAdmin: false,
      canAccessDashboard: true,
      tableAccess: {
        profiles: 'View own volunteer profile and assignments',
        training_projects: 'View public courses to assist learners',
        student_enrolments: 'Mentorship read-only assistance',
        donations: 'No direct access (RLS restricted)',
      },
      routeMatrix: {
        '/admin': {
          path: '/admin',
          expectedStatus: 'REDIRECT_UNAUTHORIZED',
          description: 'Blocked by RBAC middleware -> redirects to /unauthorized (403)',
        },
        '/dashboard': {
          path: '/dashboard',
          expectedStatus: 'ALLOW',
          description: 'Access to volunteer portal',
        },
      },
    },
    {
      role: 'Donor',
      displayName: 'Donor',
      badgeColor: 'rose',
      canAccessAdmin: false,
      canAccessDashboard: true,
      tableAccess: {
        profiles: 'View own donor profile',
        training_projects: 'View sponsored educational tracks & impact metrics',
        student_enrolments: 'No direct access to individual student records',
        donations: 'View own contribution receipts and tax summaries',
      },
      routeMatrix: {
        '/admin': {
          path: '/admin',
          expectedStatus: 'REDIRECT_UNAUTHORIZED',
          description: 'Blocked by RBAC middleware -> redirects to /unauthorized (403)',
        },
        '/dashboard': {
          path: '/dashboard',
          expectedStatus: 'ALLOW',
          description: 'Access to philanthropic impact dashboard',
        },
      },
    },
    {
      role: 'Guest',
      displayName: 'Unauthenticated Guest',
      badgeColor: 'slate',
      canAccessAdmin: false,
      canAccessDashboard: false,
      tableAccess: {
        profiles: 'No access (RLS requires authenticated session)',
        training_projects: 'View active courses via public catalog API',
        student_enrolments: 'No access',
        donations: 'Can submit new anonymous donations',
      },
      routeMatrix: {
        '/admin': {
          path: '/admin',
          expectedStatus: 'REDIRECT_LOGIN',
          description: 'Blocked by Auth Guard -> redirects to /login?redirect=/admin',
        },
        '/dashboard': {
          path: '/dashboard',
          expectedStatus: 'REDIRECT_LOGIN',
          description: 'Blocked by Auth Guard -> redirects to /login?redirect=/dashboard',
        },
        '/login': {
          path: '/login',
          expectedStatus: 'ALLOW',
          description: 'Accessible to sign in',
        },
        '/signup': {
          path: '/signup',
          expectedStatus: 'ALLOW',
          description: 'Accessible to create account',
        },
        '/': {
          path: '/',
          expectedStatus: 'ALLOW',
          description: 'Public marketing & landing page',
        },
      },
    },
  ];

  return NextResponse.json({
    status: 'ok',
    testedAt: new Date().toISOString(),
    totalRoles: roles.length,
    roles,
    enforcementMechanism: {
      layer1: 'Next.js Edge Middleware (src/middleware.ts) for route-level redirects & 403 guard',
      layer2: 'Supabase Row Level Security (supabase/rls_policies.sql) for database table-level security',
      layer3: 'Database Trigger (supabase/auth_profile_trigger.sql) for automatic role assignment on signup',
    },
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
