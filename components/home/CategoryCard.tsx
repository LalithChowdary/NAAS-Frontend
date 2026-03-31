import { ReactNode } from 'react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export default function CategoryCard({ title, description, icon }: CategoryCardProps) {
  return (
    <div className="group p-8 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 flex flex-col items-start cursor-pointer">
      <div className="p-4 bg-white rounded-2xl shadow-sm shadow-slate-200/50 text-slate-800 mb-6 group-hover:scale-105 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 tracking-tight mb-3">
        {title}
      </h3>
      <p className="text-slate-500 font-light leading-relaxed">
        {description}
      </p>
    </div>
  );
}
