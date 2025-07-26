import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDay } from './types';
import { getAttendanceStatus, getClassCount, isToday, weekDays } from '../utils/calendarHelpers';

interface CalendarGridProps {
  calendarDays: CalendarDay[];
  loading: boolean;
  error: string | null;
  selectedDay: CalendarDay | null;
  onDayClick: (day: CalendarDay) => void;
}

export default function CalendarGrid({
  calendarDays,
  loading,
  error,
  selectedDay,
  onDayClick
}: CalendarGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`header-${i}`} className="bg-white font-medium text-center py-2 text-xs text-gray-500">
            {weekDays[i]}
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`day-${i}`} className="aspect-square h-10" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center p-4">
        <div className="text-red-500 mb-2 text-sm">{error}</div>
        <p className="text-gray-500 text-sm">Please try selecting another month or refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
      {/* Week days header */}
      {weekDays.map((day) => (
        <div key={day} className="bg-white font-medium text-center py-2 text-xs text-gray-500">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {calendarDays.map((day, index) => {
        const attendanceStatus = getAttendanceStatus(day);
        const classCount = getClassCount(day);
        const hasClasses = classCount > 0;
        const isSelected = selectedDay?.date.toDateString() === day.date.toDateString();
        const isTodayDate = isToday(day.date);
        
        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`bg-white h-10 relative flex flex-col items-center justify-start
                    ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-800'}
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    ${isTodayDate ? 'ring-1 ring-inset ring-blue-300' : ''}
                  `}
                  onClick={() => onDayClick(day)}
                >
                  <span className={`text-xs font-medium mt-1 ${isTodayDate ? 'text-blue-500' : ''}`}>
                    {day.date.getDate()}
                  </span>
                  
                  {/* Attendance indicator */}
                  {hasClasses && (
                    <div className="mt-1">
                      <div 
                        className={`w-2 h-2 rounded-full
                          ${attendanceStatus === 'full' ? 'bg-green-500' : ''}
                          ${attendanceStatus === 'partial' ? 'bg-yellow-500' : ''}
                          ${attendanceStatus === 'absent' ? 'bg-red-500' : ''}
                        `}
                      />
                    </div>
                  )}
                  
                  {/* Class count indicator - only show if has classes */}
                  {hasClasses && (
                    <span className="absolute bottom-0 right-0 text-xxs bg-blue-100 text-blue-700 px-1 rounded-tl text-center" style={{ fontSize: '0.6rem' }}>
                      {classCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent hidden={!hasClasses} side="bottom">
                <div className="p-1 max-w-xs">
                  <p className="font-medium text-xs">{day.date.toLocaleDateString()}</p>
                  <ul className="text-xs mt-1">
                    {day.attendanceData?.dailyAttendance?.subjects.map((subject) => (
                      <li key={subject.id} className="flex items-center gap-1 mb-1">
                        <Badge className={`text-white text-xs py-0.5 ${
                          subject.attendedClasses === subject.totalClasses ? "bg-green-500" : 
                          subject.attendedClasses > 0 ? "bg-yellow-500" : "bg-red-500"
                        }`}>
                          {subject.attendedClasses}/{subject.totalClasses}
                        </Badge>
                        <span className="truncate">{subject.subjectCode}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
} 