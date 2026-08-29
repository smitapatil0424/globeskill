import Link from 'next/link';

export default function CommunityStories() {
  const stories = [
    {
      name: 'Aarav Sharma',
      prevRole: 'High School Graduate (First-gen Learner)',
      newRole: 'Junior Cloud Associate at Tech Partner',
      track: 'Cloud & AI Foundations',
      quote:
        'Before GlobeSkill, I had never written a single line of code or touched cloud architecture. The mentors guided me step-by-step, gave me hardware access, and helped me build confidence for my first tech interview.',
      initials: 'AS',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      name: 'Pooja Reddy',
      prevRole: 'Vocational College Student',
      newRole: 'Full-Stack Developer Intern',
      track: 'Web Development & Python',
      quote:
        'The hands-on projects and weekly hackathons made all the difference. Having a dedicated mentor review my portfolio gave me the edge I needed to land my internship in web development.',
      initials: 'PR',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      name: 'Farhan Akhtar',
      prevRole: 'Non-Tech Diploma Holder',
      newRole: 'Data Operations Trainee',
      track: 'Digital Literacy & Data Fundamentals',
      quote:
        'GlobeSkill bridged the digital gap for our small town community. The courses are 100% free yet the curriculum is world-class and directly aligned with modern job market requirements.',
      initials: 'FA',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <section id="stories" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            Voices of Change
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
            Real Stories, Real Transformations
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            See how accessible tech skilling has unlocked real career horizons and economic mobility for our learners and their families.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 rounded-2xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Quote Icon */}
                <svg className="w-8 h-8 text-blue-600/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${story.badgeColor}`}>
                  {story.initials}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{story.name}</h3>
                  <p className="text-xs font-semibold text-blue-700">{story.newRole}</p>
                  <p className="text-[11px] text-slate-400">{story.track}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Alignment & SDG Banner */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold">Committed to Sustainable Development</h3>
            <p className="text-sm text-blue-200">
              Aligning grassroots technology education with United Nations SDGs 4 (Quality Education) &amp; 8 (Decent Work &amp; Economic Growth).
            </p>
          </div>
          <Link
            href="/dashboard/admin/sdg"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white shadow-md transition-colors whitespace-nowrap"
          >
            View SDG Impact Report &rarr;
          </Link>
        </div>

      </div>
    </section>
  );
}
