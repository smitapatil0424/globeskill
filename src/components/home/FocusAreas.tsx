import Link from 'next/link';

export default function FocusAreas() {
  const areas = [
    {
      id: 'digital-literacy',
      number: '01',
      title: 'Digital Literacy & Basic Tech Skills',
      description:
        'Foundational computing essentials, internet safety, productivity tools, and operating system proficiency designed for first-generation digital learners.',
      highlights: ['Computer Fundamentals', 'Internet Safety & Cyber Hygiene', 'Office & Productivity Suites'],
      iconBg: 'bg-blue-100 text-blue-700',
      badge: 'Foundation Track',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'emerging-tech',
      number: '02',
      title: 'Emerging Technologies (AI, Cloud & Code)',
      description:
        'Hands-on immersion in practical artificial intelligence, modern web development, cloud computing basics, and algorithmic problem solving.',
      highlights: ['Applied AI & Prompt Engineering', 'Full-Stack Web Development', 'Cloud Fundamentals (AWS/Azure)'],
      iconBg: 'bg-indigo-100 text-indigo-700',
      badge: 'Advanced Track',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'employability',
      number: '03',
      title: 'Employability, Mentorship & Soft Skills',
      description:
        'Closing the workplace gap through resume building, mock technical interviews, business communication, and dedicated mentorship from industry professionals.',
      highlights: ['1-on-1 Career Mentoring', 'Technical Resume & Portfolios', 'Corporate Interview Readiness'],
      iconBg: 'bg-emerald-100 text-emerald-700',
      badge: 'Career Enablement',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'inclusive-skilling',
      number: '04',
      title: 'Inclusive Skilling & Women in Tech',
      description:
        'Targeted affirmative action initiatives, girls-in-STEM cohorts, and accessible learning pathways for rural and economically marginalized students.',
      highlights: ['Affirmative Cohorts for Women', 'Vernacular & Low-Bandwidth Labs', 'Scholarships & Device Grants'],
      iconBg: 'bg-purple-100 text-purple-700',
      badge: 'Social Equity',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <section id="focus-areas" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider">
            Our Core Initiatives
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
            Empowering Through Four Foundational Pillars
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Inspired by Glob TechPower Foundation’s mission to equip young minds with tangible, industry-aligned capabilities that transform generational livelihoods.
          </p>
        </div>

        {/* 4 Focus Area Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {areas.map((area) => (
            <div
              key={area.id}
              className="group relative bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg ${area.iconBg}`}>
                    {area.number}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${area.badgeColor}`}>
                    {area.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {area.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                  {area.description}
                </p>

                {/* Micro Key Focus Tags */}
                <div className="space-y-2 mb-8">
                  {area.highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors group-hover:translate-x-1 duration-150"
                >
                  <span>Explore Track Curriculum</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
