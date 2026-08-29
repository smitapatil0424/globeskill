import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface TableDiagnostic {
  name: string;
  exists: boolean;
  count: number;
  sample?: Record<string, unknown> | null;
  error?: string | null;
}

export interface DbTestResponse {
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

export async function GET() {
  const startTime = Date.now();
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder'));
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder'));
  const isMock = !rawUrl || rawUrl.includes('your-project-id') || rawUrl.includes('placeholder');

  const maskedUrl = rawUrl
    ? rawUrl.replace(/^https:\/\/(.{4}).*?(\.supabase\.co.*)?$/, 'https://$1***$2')
    : 'Not configured';

  // 1. Mock / Local dev fallback mode
  if (isMock) {
    const mockTables: Record<string, TableDiagnostic> = {
      profiles: {
        name: 'profiles',
        exists: true,
        count: 6,
        sample: {
          id: 'd0000000-0000-0000-0000-000000000001',
          full_name: 'Dr. Aris Thorne',
          email: 'aris.thorne@globeskill.org',
          role: 'Trainer',
          is_verified: true,
        },
      },
      training_projects: {
        name: 'training_projects',
        exists: true,
        count: 3,
        sample: {
          id: 'c0000000-0000-0000-0000-000000000001',
          title: 'IBM SkillsBuild - Frontend Development',
          category: 'Web Development',
          partner_organization: 'IBM SkillsBuild',
          status: 'active',
        },
      },
      student_enrolments: {
        name: 'student_enrolments',
        exists: true,
        count: 3,
        sample: {
          id: 'e0000000-0000-0000-0000-000000000001',
          status: 'in_progress',
          progress_percentage: 65,
        },
      },
      donations: {
        name: 'donations',
        exists: true,
        count: 2,
        sample: {
          id: 'b0000000-0000-0000-0000-000000000001',
          amount: 25000,
          currency: 'USD',
          payment_status: 'succeeded',
        },
      },
      assessments: {
        name: 'assessments',
        exists: true,
        count: 3,
        sample: {
          id: 'a0000000-0000-0000-0000-000000000001',
          title: 'Frontend Web Development Milestone Quiz',
          passing_score: 75,
          duration_minutes: 30,
        },
      },
      quiz_questions: {
        name: 'quiz_questions',
        exists: true,
        count: 15,
        sample: {
          id: 'q0000000-0000-0000-0000-000000000001',
          question_text: 'Which React hook is designed for managing state transitions?',
          points: 10,
        },
      },
      student_attempts: {
        name: 'student_attempts',
        exists: true,
        count: 8,
        sample: {
          id: 'att00000-0000-0000-0000-000000000001',
          score_percentage: 90.0,
          passed: true,
          attempt_number: 1,
        },
      },
    };

    const response: DbTestResponse = {
      timestamp: new Date().toISOString(),
      mode: 'mock',
      status: 'unconfigured',
      latencyMs: Date.now() - startTime,
      supabaseUrl: maskedUrl,
      hasAnonKey,
      hasServiceRoleKey,
      tables: mockTables,
      message: 'Database is in local mock mode. To connect to live Supabase, update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }

  // 2. Live Supabase Connection Mode
  try {
    const supabase = await createClient();
    const tableNames = [
      'profiles',
      'training_projects',
      'student_enrolments',
      'donations',
      'assessments',
      'quiz_questions',
      'student_attempts',
    ];
    const tableResults: Record<string, TableDiagnostic> = {};

    for (const table of tableNames) {
      try {
        const { count, data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);

        if (error) {
          tableResults[table] = {
            name: table,
            exists: false,
            count: 0,
            error: error.message,
          };
        } else {
          tableResults[table] = {
            name: table,
            exists: true,
            count: count ?? 0,
            sample: (data && data[0]) ? data[0] : null,
          };
        }
      } catch (err) {
        tableResults[table] = {
          name: table,
          exists: false,
          count: 0,
          error: err instanceof Error ? err.message : 'Query failed',
        };
      }
    }

    const latency = Date.now() - startTime;
    const allPassed = Object.values(tableResults).every((t) => t.exists);

    const response: DbTestResponse = {
      timestamp: new Date().toISOString(),
      mode: 'live',
      status: allPassed ? 'connected' : 'error',
      latencyMs: latency,
      supabaseUrl: maskedUrl,
      hasAnonKey,
      hasServiceRoleKey,
      tables: tableResults,
      message: allPassed
        ? `Successfully connected to Supabase in ${latency}ms. All 4 tables are accessible.`
        : 'Connected to Supabase, but one or more tables failed query check (check if migrations were applied).',
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    const response: DbTestResponse = {
      timestamp: new Date().toISOString(),
      mode: 'live',
      status: 'error',
      latencyMs: latency,
      supabaseUrl: maskedUrl,
      hasAnonKey,
      hasServiceRoleKey,
      tables: {},
      message: 'Failed to establish connection to Supabase.',
      details: error instanceof Error ? error.message : 'Unknown database error',
    };

    return NextResponse.json(response, {
      status: 500,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }
}
