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
          className="text-slate-800 dark:text-white" 
          strokeWidth={1.5}
        />
        {/* Blue Star/Accent in the middle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">
           <Star 
             size={iconSize * 0.4} 
             className="text-blue-500 fill-blue-500" 
           />
        </div>
        {/* Graduation Cap floating above */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <GraduationCap 
            size={iconSize * 0.7} 
            className="text-slate-800 dark:text-white"
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Text Container */}
      <span className={`font-black tracking-tight ${textClassName}`}>
        <span className="text-slate-800 dark:text-white">Özel Ders</span>
        <span className="text-blue-500 ml-1.5">VIP</span>
      </span>
    </div>
  );
}
