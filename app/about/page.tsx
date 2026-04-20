export const metadata = {
  title: "About & Contact | NAAS.",
  description: "Learn more about the team behind NAAS.",
};

export default function AboutPage() {
  const team = [
    { name: "Lalith Chowdary", email: "vc239@snu.edu.in" },
    { name: "Sashreek Kandagatla", email: "sk437@snu.edu.in" },
    { name: "Revanth Ungarala", email: "un923@snu.edu.in" },
    { name: "Tanuj Kinjarapu", email: "tk237@snu.edu.in" },
  ];

  return (
    <div className="min-h-[80vh] w-full bg-[#FBFBFD] flex flex-col items-center justify-center py-24 px-6">
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            About Us.
          </h1>
          <p className="text-lg text-slate-500 font-light leading-relaxed">
            We are the team behind the Newspaper Agency Automation System (NAAS). Built as a modern solution to streamline print distribution, billing, and customer management seamlessly.
          </p>
        </div>

        {/* Contact / Team Section */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-8 border-b border-slate-100 pb-4">
            Contact the Team
          </h2>
          
          <ul className="space-y-6">
            {team.map((member, index) => (
              <li key={index} className="flex flex-col sm:flex-row sm:items-center justify-between group">
                <span className="text-[17px] font-medium text-slate-900 mb-1 sm:mb-0">
                  {member.name}
                </span>
                <a 
                  href={`mailto:${member.email}`} 
                  className="text-[15px] font-mono text-slate-500 group-hover:text-slate-900 group-hover:underline decoration-slate-300 transition-colors"
                >
                  {member.email}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
