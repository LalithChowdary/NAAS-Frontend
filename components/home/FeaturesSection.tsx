export default function FeaturesSection() {
  const features = [
    {
      title: "Reliable Daily Delivery",
      description: "Consistent, early morning drops designed around your schedule, rain or shine.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
      )
    },
    {
      title: "Easy Pause & Resume",
      description: "Going out of town? Pause your subscription with a single tap and resume when you return.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="4" width="4" height="16" rx="1"></rect>
          <rect x="6" y="4" width="4" height="16" rx="1"></rect>
        </svg>
      )
    },
    {
      title: "Transparent Billing",
      description: "No hidden fees or unexpected charges. View and manage your monthly statements easily.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
          <line x1="2" x2="22" y1="10" y2="10"></line>
        </svg>
      )
    },
    {
      title: "Customer Focused",
      description: "Dedicated support team ensuring your preferred publications always reach you correctly.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    }
  ];

  return (
    <section className="w-full bg-slate-50 border-t border-slate-100 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-4">
            Why Choose NAAS.
          </h2>
          <p className="text-slate-500 font-light max-w-xl mx-auto">
            We focus on the details so you can focus on the news. Redefining how physical media reaches your home.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-800 shadow-sm shadow-slate-200/50 mb-6 border border-slate-100">
                {feature.icon}
              </div>
              <h4 className="text-lg font-semibold text-slate-900 tracking-tight mb-2">
                {feature.title}
              </h4>
              <p className="text-sm text-slate-500 font-light leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
