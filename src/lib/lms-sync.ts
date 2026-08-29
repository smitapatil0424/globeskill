import { createClient } from '@/lib/supabase/server';
import { TrainingProject, ProjectStatus } from '@/types/database';

/**
 * ============================================================================
 * EXTERNAL SCHEMA: IBM SKILLSBUILD LMS API CONTRACT
 * ============================================================================
 * Represents the incoming course payload from IBM SkillsBuild's REST API.
 */
export interface ExternalIBMCourse {
  course_id: string;
  title: string;
  summary: string;
  track: string;
  level: 'Introductory' | 'Intermediate' | 'Advanced';
  estimated_effort_hours: number;
  max_learners: number;
  is_published: boolean;
  partner: string;
  certification_type: string;
  curriculum_version: string;
  last_modified: string;
}

export interface LMSSyncResult {
  success: boolean;
  syncedAt: string;
  source: string;
  totalFetched: number;
  inserted: number;
  updated: number;
  failed: number;
  logs: string[];
  projects: Partial<TrainingProject>[];
}

/**
 * Mock external course catalog from IBM SkillsBuild
 */
const MOCK_IBM_CATALOG: ExternalIBMCourse[] = [
  {
    course_id: 'IBM-SB-FE-01',
    title: 'IBM SkillsBuild: Frontend Web Development with React',
    summary: 'Comprehensive hands-on curriculum covering modern HTML5, responsive CSS3, JavaScript ESNext, and React 19 component design.',
    track: 'Software Engineering',
    level: 'Introductory',
    estimated_effort_hours: 40,
    max_learners: 75,
    is_published: true,
    partner: 'IBM SkillsBuild',
    certification_type: 'Digital Badge & IBM Verified Credential',
    curriculum_version: '2026.2',
    last_modified: '2026-08-20T10:00:00Z',
  },
  {
    course_id: 'IBM-SB-AI-02',
    title: 'IBM SkillsBuild: Enterprise AI, LLMs & Prompt Engineering',
    summary: 'Deep-dive into generative AI architectures, foundational LLMs, prompt engineering patterns, and enterprise AI safety.',
    track: 'Artificial Intelligence',
    level: 'Intermediate',
    estimated_effort_hours: 60,
    max_learners: 50,
    is_published: true,
    partner: 'IBM SkillsBuild',
    certification_type: 'IBM Applied AI Practitioner Certificate',
    curriculum_version: '2026.3',
    last_modified: '2026-08-22T14:30:00Z',
  },
  {
    course_id: 'IBM-SB-CLOUD-03',
    title: 'IBM SkillsBuild: Hybrid Cloud & Kubernetes Administration',
    summary: 'Learn hybrid cloud infrastructure management, container orchestration with Kubernetes, Docker, and Linux system automation.',
    track: 'Cloud & Infrastructure',
    level: 'Intermediate',
    estimated_effort_hours: 50,
    max_learners: 60,
    is_published: true,
    partner: 'IBM SkillsBuild',
    certification_type: 'IBM Cloud Specialist Badge',
    curriculum_version: '2026.1',
    last_modified: '2026-08-15T09:00:00Z',
  },
  {
    course_id: 'IBM-SB-DATA-04',
    title: 'IBM SkillsBuild: Data Science Fundamentals & SQL Analytics',
    summary: 'Master relational data modeling, advanced SQL queries, Python data analysis with Pandas, and automated executive dashboards.',
    track: 'Data Science',
    level: 'Introductory',
    estimated_effort_hours: 45,
    max_learners: 80,
    is_published: true,
    partner: 'IBM SkillsBuild',
    certification_type: 'IBM Data Science Associate Credential',
    curriculum_version: '2026.2',
    last_modified: '2026-08-18T11:20:00Z',
  },
  {
    course_id: 'IBM-SB-SEC-05',
    title: 'IBM SkillsBuild: Cyber Threat Intelligence & Defensive Operations',
    summary: 'Analyze cyber threat vectors, incident response protocols, network intrusion detection, and Zero Trust security architecture.',
    track: 'Cybersecurity',
    level: 'Advanced',
    estimated_effort_hours: 65,
    max_learners: 40,
    is_published: true,
    partner: 'IBM SkillsBuild',
    certification_type: 'IBM Cybersecurity Analyst Credential',
    curriculum_version: '2026.4',
    last_modified: '2026-08-25T16:00:00Z',
  },
];

/**
 * Helper: Generate URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * ============================================================================
 * SCHEMA MAPPER: EXTERNAL IBM SCHEMA -> INTERNAL TRAINING_PROJECTS SCHEMA
 * ============================================================================
 */
export function mapIBMCourseToInternal(
  external: ExternalIBMCourse
): Omit<TrainingProject, 'id' | 'created_at' | 'updated_at'> {
  // Map category taxonomy
  let internalCategory = 'Web Development';
  const trackLower = external.track.toLowerCase();

  if (trackLower.includes('ai') || trackLower.includes('artificial intelligence')) {
    internalCategory = 'Artificial Intelligence';
  } else if (trackLower.includes('cloud') || trackLower.includes('infrastructure')) {
    internalCategory = 'Cloud Engineering';
  } else if (trackLower.includes('data') || trackLower.includes('analytics')) {
    internalCategory = 'Data Science';
  } else if (trackLower.includes('cyber') || trackLower.includes('security')) {
    internalCategory = 'Cybersecurity';
  }

  // Map difficulty level
  let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
  if (external.level === 'Intermediate') {
    difficulty = 'Intermediate';
  } else if (external.level === 'Advanced') {
    difficulty = 'Advanced';
  }

  // Estimate duration in weeks (assumes ~5 hours/week study commitment)
  const durationWeeks = Math.max(1, Math.round(external.estimated_effort_hours / 5));

  const status: ProjectStatus = external.is_published ? 'active' : 'draft';
  const slug = slugify(external.title);

  return {
    title: external.title,
    slug,
    description: external.summary,
    partner_organization: external.partner || 'IBM SkillsBuild',
    category: internalCategory,
    difficulty_level: difficulty,
    duration_weeks: durationWeeks,
    max_capacity: external.max_learners || 50,
    status,
    trainer_id: null,
  };
}

/**
 * Mock Client: Simulates fetching external course list from IBM SkillsBuild API
 */
export async function fetchExternalIBMCourses(): Promise<ExternalIBMCourse[]> {
  // Simulate network latency (250ms)
  await new Promise((resolve) => setTimeout(resolve, 250));
  return MOCK_IBM_CATALOG;
}

/**
 * ============================================================================
 * CORE SYNCHRONIZATION FUNCTION: SYNC IBM SKILLSBUILD COURSES TO SUPABASE
 * ============================================================================
 * Responsibilities:
 *  1. Fetches course catalog from external provider.
 *  2. Transforms external payload into internal training_projects contracts.
 *  3. Upserts records into PostgreSQL (inserting new or updating existing by slug).
 *  4. Produces real-time tracing logs for audit and monitoring.
 */
export async function syncIBMSkillsBuildCourses(): Promise<LMSSyncResult> {
  const syncTimestamp = new Date().toISOString();
  const logs: string[] = [];

  const log = (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR', message: string) => {
    const entry = `[LMS-SYNC][${new Date().toISOString()}][${level}] ${message}`;
    logs.push(entry);
    if (level === 'ERROR') {
      console.error(entry);
    } else if (level === 'WARN') {
      console.warn(entry);
    } else {
      console.log(entry);
    }
  };

  log('INFO', 'Initiating automated curriculum synchronization with external provider: "IBM SkillsBuild"...');

  let rawCourses: ExternalIBMCourse[] = [];
  try {
    rawCourses = await fetchExternalIBMCourses();
    log('INFO', `Successfully fetched ${rawCourses.length} course definitions from IBM SkillsBuild API.`);
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : 'Unknown network failure';
    log('ERROR', `Failed to connect to IBM SkillsBuild API endpoint: ${msg}`);
    return {
      success: false,
      syncedAt: syncTimestamp,
      source: 'IBM SkillsBuild',
      totalFetched: 0,
      inserted: 0,
      updated: 0,
      failed: 1,
      logs,
      projects: [],
    };
  }

  let insertedCount = 0;
  let updatedCount = 0;
  let failedCount = 0;
  const processedProjects: Partial<TrainingProject>[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isMockDev =
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('your-project-id');

  // Local Mock Mode Execution
  if (isMockDev) {
    log('WARN', 'Operating in Local Development & Offline Mock Mode. Simulating database upsert transactions.');

    for (const external of rawCourses) {
      try {
        const mapped = mapIBMCourseToInternal(external);
        log(
          'INFO',
          `Transforming [${external.course_id}]: "${external.title}" -> Category: "${mapped.category}", Duration: ${mapped.duration_weeks} wks, Capacity: ${mapped.max_capacity}.`
        );

        // Simulate existing check (first 2 mock courses already exist in seed)
        const isExisting = external.course_id === 'IBM-SB-FE-01' || external.course_id === 'IBM-SB-AI-02';

        if (isExisting) {
          log('INFO', `Course record exists for slug "${mapped.slug}". Executing PostgreSQL UPDATE.`);
          updatedCount++;
        } else {
          log('INFO', `New curriculum detected for slug "${mapped.slug}". Executing PostgreSQL INSERT.`);
          insertedCount++;
        }

        processedProjects.push({
          id: `c-lms-${external.course_id.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          ...mapped,
          created_at: external.last_modified,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        failedCount++;
        log('ERROR', `Transformation error on course [${external.course_id}]: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    log(
      'SUCCESS',
      `Curriculum synchronization completed successfully! Summary: Total Fetched: ${rawCourses.length} | Inserted: ${insertedCount} | Updated: ${updatedCount} | Failed: ${failedCount}.`
    );

    return {
      success: true,
      syncedAt: syncTimestamp,
      source: 'IBM SkillsBuild',
      totalFetched: rawCourses.length,
      inserted: insertedCount,
      updated: updatedCount,
      failed: failedCount,
      logs,
      projects: processedProjects,
    };
  }

  // Live Supabase PostgreSQL Execution
  try {
    const supabase = await createClient();

    for (const external of rawCourses) {
      try {
        const mapped = mapIBMCourseToInternal(external);
        log(
          'INFO',
          `Processing [${external.course_id}] "${external.title}": mapped to category "${mapped.category}", ${mapped.duration_weeks} weeks.`
        );

        // Check if project exists by slug
        const { data: existing, error: checkError } = await supabase
          .from('training_projects')
          .select('id, slug, title')
          .eq('slug', mapped.slug)
          .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        if (existing) {
          // UPDATE existing record
          const { data: updated, error: updateError } = await supabase
            .from('training_projects')
            .update({
              title: mapped.title,
              description: mapped.description,
              partner_organization: mapped.partner_organization,
              category: mapped.category,
              difficulty_level: mapped.difficulty_level,
              duration_weeks: mapped.duration_weeks,
              max_capacity: mapped.max_capacity,
              status: mapped.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (updateError) throw updateError;

          updatedCount++;
          processedProjects.push(updated as TrainingProject);
          log('SUCCESS', `Successfully UPDATED existing project: "${mapped.title}" (ID: ${existing.id}).`);
        } else {
          // INSERT new record
          const { data: inserted, error: insertError } = await supabase
            .from('training_projects')
            .insert({
              title: mapped.title,
              slug: mapped.slug,
              description: mapped.description,
              partner_organization: mapped.partner_organization,
              category: mapped.category,
              difficulty_level: mapped.difficulty_level,
              duration_weeks: mapped.duration_weeks,
              max_capacity: mapped.max_capacity,
              status: mapped.status,
            })
            .select()
            .single();

          if (insertError) throw insertError;

          insertedCount++;
          processedProjects.push(inserted as TrainingProject);
          log('SUCCESS', `Successfully INSERTED new project: "${mapped.title}" (Slug: ${mapped.slug}).`);
        }
      } catch (itemError) {
        failedCount++;
        const msg = itemError instanceof Error ? itemError.message : 'Database error';
        log('ERROR', `Failed to upsert course [${external.course_id}] "${external.title}": ${msg}`);
      }
    }

    log(
      'SUCCESS',
      `Live synchronization completed. Total: ${rawCourses.length} | Inserted: ${insertedCount} | Updated: ${updatedCount} | Failed: ${failedCount}.`
    );

    return {
      success: failedCount === 0,
      syncedAt: syncTimestamp,
      source: 'IBM SkillsBuild',
      totalFetched: rawCourses.length,
      inserted: insertedCount,
      updated: updatedCount,
      failed: failedCount,
      logs,
      projects: processedProjects,
    };
  } catch (fatalError) {
    const errorMsg = fatalError instanceof Error ? fatalError.message : 'Unknown database error';
    log('ERROR', `Fatal error during database transaction: ${errorMsg}`);

    return {
      success: false,
      syncedAt: syncTimestamp,
      source: 'IBM SkillsBuild',
      totalFetched: rawCourses.length,
      inserted: insertedCount,
      updated: updatedCount,
      failed: failedCount + 1,
      logs,
      projects: processedProjects,
    };
  }
}
