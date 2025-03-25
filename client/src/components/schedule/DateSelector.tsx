import { useState } from "react";
import { getUpcomingDays } from "@/lib/utils";

interface DateSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  const upcomingDays = getUpcomingDays(7);
  
  // Format date to ISO for comparison
  const formatDateIso = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const selectedDateIso = formatDateIso(selectedDate);
  
  return (
    <div className="flex space-x-2 overflow-x-auto custom-scrollbar pb-2 mb-4">
      {upcomingDays.map((day) => {
        const isSelected = formatDateIso(day.dateObj) === selectedDateIso;
        
        return (
          <button
            key={day.dayName + day.date}
            className={`flex flex-col items-center min-w-[60px] p-2 rounded-lg transition-colors ${
              isSelected ? 'bg-[#282828]' : 'hover:bg-[#282828]/50'
            }`}
            onClick={() => onDateSelect(day.dateObj)}
          >
            <span className="text-xs text-[#B3B3B3]">{day.dayName}</span>
            <span className={`text-lg font-medium ${isSelected ? 'text-[#3CAEFF]' : ''}`}>
              {day.date}
            </span>
          </button>
        );
      })}
    </div>
  );
}
