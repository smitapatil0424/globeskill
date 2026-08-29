import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Sdg4Metrics, Sdg8Metrics, Sdg9Metrics } from '@/types/database';

/**
 * ============================================================================
 * API CONTROLLER: UN SUSTAINABLE DEVELOPMENT GOALS (SDGs) IMPACT ANALYTICS
 * ============================================================================
 * Endpoint: GET /api/admin/sdg-metrics
 *
 * Impact Goals Tracked:
 *  - SDG 4: Quality Education (Learners trained, courses completed, pass rates)
 *  - SDG 8: Decent Work & Economic Growth (Graduated youth, job-ready credentials)
 *  - SDG 9: Industry & Innovation (Geographic distribution across Tier 2 & Tier 3 hubs)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isMockDev =
      !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-project-id');

    if (!isMockDev) {
      // 1. Fetch SDG 4 Metrics (Quality Education)
      const { data: sdg4Data, error: sdg4Err } = await supabase
        .from('sdg_4_metrics')
        .select('*')
        .single();

      // 2. Fetch SDG 8 Metrics (Economic Growth & Job Tracks)
      const { data: sdg8Data, error: sdg8Err } = await supabase
        .from('sdg_8_metrics')
        .select('*')
        .single();

      // 3. Fetch SDG 9 Metrics (Regional Tier 2 & Tier 3 Hubs)
      const { data: sdg9Data, error: sdg9Err } = await supabase
        .from('sdg_9_metrics')
        .select('*')
        .order('registered_learners', { ascending: false });

      if (!sdg4Err && !sdg8Err && !sdg9Err) {
        return NextResponse.json({
          success: true,
          mode: 'live',
          sdg4: sdg4Data,
          sdg8: sdg8Data,
          sdg9: sdg9Data,
        });
      }
    }

    // Local Mock Dev Mode Fallback: Synthesized metrics aligned with seed data
    const mockSdg4: Sdg4Metrics = {
      total_learners_trained: 148,
      total_course_enrollments: 215,
      digital_courses_completed: 84,
      active_learners_in_progress: 112,
      accredited_curriculums_delivered: 6,
      total_training_weeks_completed: 672,
      avg_assessment_score_percentage: 84.5,
      assessment_pass_rate_percentage: 89.2,
      overall_completion_rate_percentage: 78.4,
      last_aggregated_at: new Date().toISOString(),
    };

    const mockSdg8: Sdg8Metrics = {
      graduated_youth_count: 84,
      job_ready_credentials_issued: 84,
      high_growth_tech_graduates: 62,
      employment_ready_candidates: 76,
      avg_weeks_to_graduation: 8.0,
      active_industry_mentors: 4,
      youth_economic_readiness_index: 90.5,
      last_aggregated_at: new Date().toISOString(),
    };

    const mockSdg9: Sdg9Metrics[] = [
      {
        hub_id: 'h0000000-0000-0000-0000-000000000001',
        hub_name: 'Jaipur Innovation Center',
        location_city: 'Jaipur',
        state_region: 'Rajasthan',
        country: 'India',
        hub_tier: 'Tier 2 Emerging City',
        broadband_connectivity: 'Optical Fiber Gigabit',
        workstations_count: 75,
        registered_learners: 42,
        hub_enrollments: 58,
        hub_graduated_count: 24,
        innovation_credentials_earned: 19,
        hub_workstation_utilization_percentage: 77.3,
        last_aggregated_at: new Date().toISOString(),
      },
      {
        hub_id: 'h0000000-0000-0000-0000-000000000002',
        hub_name: 'Coimbatore Skills Academy',
        location_city: 'Coimbatore',
        state_region: 'Tamil Nadu',
        country: 'India',
        hub_tier: 'Tier 2 Emerging City',
        broadband_connectivity: 'Dedicated Leased Line',
        workstations_count: 65,
        registered_learners: 36,
        hub_enrollments: 48,
        hub_graduated_count: 21,
        innovation_credentials_earned: 16,
        hub_workstation_utilization_percentage: 73.8,
        last_aggregated_at: new Date().toISOString(),
      },
      {
        hub_id: 'h0000000-0000-0000-0000-000000000003',
        hub_name: 'Vidarbha Rural Learning Hub',
        location_city: 'Amravati',
        state_region: 'Maharashtra',
        country: 'India',
        hub_tier: 'Tier 3 Rural District',
        broadband_connectivity: 'Satellite & 5G Fixed Wireless',
        workstations_count: 35,
        registered_learners: 28,
        hub_enrollments: 34,
        hub_graduated_count: 14,
        innovation_credentials_earned: 11,
        hub_workstation_utilization_percentage: 80.0,
        last_aggregated_at: new Date().toISOString(),
      },
      {
        hub_id: 'h0000000-0000-0000-0000-000000000004',
        hub_name: 'Dharwad Vocational Tech Institute',
        location_city: 'Dharwad',
        state_region: 'Karnataka',
        country: 'India',
        hub_tier: 'Tier 3 Rural District',
        broadband_connectivity: 'Rural Fiber Network',
        workstations_count: 40,
        registered_learners: 24,
        hub_enrollments: 30,
        hub_graduated_count: 13,
        innovation_credentials_earned: 9,
        hub_workstation_utilization_percentage: 60.0,
        last_aggregated_at: new Date().toISOString(),
      },
      {
        hub_id: 'h0000000-0000-0000-0000-000000000005',
        hub_name: 'Sundarbans Community Skilling Lab',
        location_city: 'Gosaba',
        state_region: 'West Bengal',
        country: 'India',
        hub_tier: 'Tier 3 Rural District',
        broadband_connectivity: 'Solar-Powered VSAT & 4G',
        workstations_count: 25,
        registered_learners: 18,
        hub_enrollments: 22,
        hub_graduated_count: 12,
        innovation_credentials_earned: 7,
        hub_workstation_utilization_percentage: 72.0,
        last_aggregated_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      mode: 'mock',
      sdg4: mockSdg4,
      sdg8: mockSdg8,
      sdg9: mockSdg9,
    });
  } catch (error) {
    console.error('SDG metrics error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve UN SDG metrics.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
