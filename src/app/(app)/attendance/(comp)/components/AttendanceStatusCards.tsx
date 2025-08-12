import { AttendanceData } from './types';
import { Calendar, UserCheck, XCircle, BookOpen, BookOpenCheck, BookX } from 'lucide-react';

export default function AttendanceStatusCards({ attendanceData }: { attendanceData: AttendanceData }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-4 flex items-center hover:shadow-xl transition-all duration-300">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Total Classes</p>
          <p className="text-xl font-bold text-foreground">{attendanceData.overallMetrics.totalClasses}</p>
        </div>
      </div>
      <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-4 flex items-center hover:shadow-xl transition-all duration-300">
        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
          <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Attended</p>
          <p className="text-xl font-bold text-foreground">{attendanceData.overallMetrics.totalAttended}</p>
        </div>
      </div>
      <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-4 flex items-center hover:shadow-xl transition-all duration-300">
        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center mr-3">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Missed</p>
          <p className="text-xl font-bold text-foreground">{attendanceData.overallMetrics.totalClasses - attendanceData.overallMetrics.totalAttended}</p>
        </div>
      </div>
      <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-4 flex items-center hover:shadow-xl transition-all duration-300">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Subjects</p>
          <p className="text-xl font-bold text-foreground">{attendanceData.subjects.length}</p>
        </div>
      </div>
      <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-4 flex items-center hover:shadow-xl transition-all duration-300">
        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
          <BookOpenCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Above 75%</p>
          <p className="text-xl font-bold text-foreground">{attendanceData.overallMetrics.subjectsAbove75Percent}</p>
        </div>
      </div>
      <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-4 flex items-center hover:shadow-xl transition-all duration-300">
        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center mr-3">
          <BookX className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Below 75%</p>
          <p className="text-xl font-bold text-foreground">{attendanceData.overallMetrics.subjectsBelow75Percent}</p>
        </div>
      </div>
    </div>
  );
} 