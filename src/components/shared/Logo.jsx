import React from "react";
import { GraduationCap, BookOpen, Star } from "lucide-react";

export default function Logo({ className = "", textClassName = "", iconSize = 32 }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon Container */}
      <div className="relative flex items-center justify-center">
        {/* Book Base */}
        <BookOpen 
          size={iconSize} 
          className="text-slate-800 dark:text-[var(--text-primary)]" 
          strokeWidth={1.5}
        />
        {/* Green Star/Accent in the middle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">
           <Star 
             size={iconSize * 0.4} 
             className="text-[#16a34a] fill-[#16a34a]" 
           />
        </div>
        {/* Graduation Cap floating above */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <GraduationCap 
            size={iconSize * 0.7} 
            className="text-slate-800 dark:text-[var(--text-primary)]"
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Text Container */}
      <span className={`font-black tracking-tight ${textClassName}`}>
        <span className="text-slate-800 dark:text-[var(--text-primary)]">Özel Ders</span>
        <span className="text-green-500 ml-1.5">VIP</span>
      </span>
    </div>
  );
}
