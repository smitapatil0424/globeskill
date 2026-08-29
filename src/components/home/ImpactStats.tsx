export default function ImpactStats() {
  const stats = [
    {
      value: '10,000+',
      label: 'Students & Youth Skilled',
      sublabel: 'Empowered across underserved communities with core digital competencies.',
      accent: 'text-blue-600',
      bg: 'bg-blue-50/50',
    },
    {
      value: '50+',
      label: 'Industry Programs & Tracks',
      sublabel: 'Co-created with technology mentors across AI, Web, and Cloud domains.',
      accent: 'text-sky-600',
      bg: 'bg-sky-50/50',
    },
    {
      value: '85%',
      label: 'Career Placement Enablement',
      sublabel: 'Graduates successfully progressing to internships, jobs, or higher studies.',
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
    },
    {
      value: 'SDG 4, 8 & 9',
      label: 'UN Sustainable Goals',
      sublabel: 'Targeting Quality Education, Decent Work, and Industry Innovation.',
      accent: 'text-amber-600',
      bg: 'bg-amber-50/50',
    },
  ];

  return (
    <section id="impact" className="relative z-10 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-10">
        
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Measurable Real-World Impact
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            Empowerment Grounded in Verified Outcomes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`pt-6 sm:pt-0 ${idx !== 0 ? 'sm:pl-6' : ''} flex flex-col justify-between`}
            >
              <div>
                <div className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${stat.accent} mb-2`}>
                  {stat.value}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {stat.label}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {stat.sublabel}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
