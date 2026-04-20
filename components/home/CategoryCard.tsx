import { ReactNode } from 'react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export default function CategoryCard({ title, description, icon }: CategoryCardProps) {
  return (
    <div className="group relative h-[360px] p-10 rounded-[32px] bg-[#FBFBFD] overflow-hidden flex flex-col items-start cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-slate-100/50">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative z-10 w-16 h-16 rounded-[20px] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] flex items-center justify-center text-slate-900 mb-auto group-hover:scale-110 transition-transform duration-500 ease-out">
        {icon}
      </div>

      <div className="relative z-10 mt-auto">
        <h3 className="text-2xl font-semibold text-slate-900 tracking-[-0.02em] mb-3">
          {title}
        </h3>
        <p className="text-[15px] text-slate-500 font-normal leading-relaxed max-w-[250px]">
          {description}
        </p>
      </div>
    </div>
  );
}
