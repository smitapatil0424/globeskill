/**
 * ============================================================================
 * DATABASE TYPES (PostgreSQL / Supabase Data Contracts)
 * ============================================================================
 */

export type UserRole =
  | 'Student'
  | 'Trainer'
  | 'Volunteer'
  | 'Donor'
  | 'NGO Administrator';

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export type EnrolmentStatus =
  | 'enrolled'
  | 'in_progress'
  | 'completed'
  | 'dropped';

export type DonationStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Profile {
  id: string; // UUID references auth.users
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  organization?: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingProject {
  id: string; // UUID
  title: string;
  slug: string;
  description?: string | null;
  partner_organization: string; // e.g. "IBM SkillsBuild"
  category: string; // e.g. "AI", "Web Development"
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_weeks: number;
  max_capacity?: number | null;
  trainer_id?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentEnrolment {
  id: string; // UUID
  student_id: string; // UUID references profiles.id
  project_id: string; // UUID references training_projects.id
  status: EnrolmentStatus;
  progress_percentage: number; // 0 - 100
  enrolled_at: string;
  completed_at?: string | null;
  certificate_url?: string | null;
  notes?: string | null;
  updated_at: string;
}

export interface Donation {
  id: string; // UUID
  donor_id?: string | null; // UUID references profiles.id
  donor_name?: string | null;
  donor_email?: string | null;
  amount: number;
  currency: string;
  project_id?: string | null; // UUID references training_projects.id
  payment_method: string;
  payment_status: DonationStatus;
  transaction_id?: string | null;
  receipt_url?: string | null;
  message?: string | null;
  is_anonymous: boolean;
  created_at: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface Assessment {
  id: string; // UUID
  project_id: string; // UUID references training_projects.id
  title: string;
  description?: string | null;
  passing_score: number; // 0 - 100
  duration_minutes: number;
  max_attempts: number;
  is_published: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string; // UUID
  assessment_id: string; // UUID references assessments.id
  question_text: string;
  options: QuizOption[];
  correct_option_id: string;
  explanation?: string | null;
  points: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface StudentAttempt {
  id: string; // UUID
  student_id: string; // UUID references profiles.id
  assessment_id: string; // UUID references assessments.id
  answers: Record<string, string>; // { question_id: selected_option_id }
  total_points_earned: number;
  total_points_possible: number;
  score_percentage: number;
  passed: boolean;
  attempt_number: number;
  started_at: string;
  submitted_at: string;
  created_at: string;
}

export interface RegionalHub {
  id: string;
  hub_name: string;
  location_city: string;
  state_region: string;
  country: string;
  hub_tier: 'Tier 1 Metro' | 'Tier 2 Emerging City' | 'Tier 3 Rural District' | 'Vocational Training Center';
  broadband_connectivity: string;
  workstations_count: number;
  established_date?: string;
  created_at: string;
}

export interface Sdg4Metrics {
  total_learners_trained: number;
  total_course_enrollments: number;
  digital_courses_completed: number;
  active_learners_in_progress: number;
  accredited_curriculums_delivered: number;
  total_training_weeks_completed: number;
  avg_assessment_score_percentage: number;
  assessment_pass_rate_percentage: number;
  overall_completion_rate_percentage: number;
  last_aggregated_at: string;
}

export interface Sdg8Metrics {
  graduated_youth_count: number;
  job_ready_credentials_issued: number;
  high_growth_tech_graduates: number;
  employment_ready_candidates: number;
  avg_weeks_to_graduation: number;
  active_industry_mentors: number;
  youth_economic_readiness_index: number;
  last_aggregated_at: string;
}

export interface Sdg9Metrics {
  hub_id: string;
  hub_name: string;
  location_city: string;
  state_region: string;
  country: string;
  hub_tier: string;
  broadband_connectivity: string;
  workstations_count: number;
  registered_learners: number;
  hub_enrollments: number;
  hub_graduated_count: number;
  innovation_credentials_earned: number;
  hub_workstation_utilization_percentage: number;
  last_aggregated_at: string;
}


