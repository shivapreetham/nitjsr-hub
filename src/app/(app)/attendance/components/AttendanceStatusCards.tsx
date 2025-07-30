import { AttendanceData } from './types';
import { Calendar, UserCheck, XCircle, BookOpen, BookOpenCheck, BookX } from 'lucide-react';

export default function AttendanceStatusCards({ attendanceData }: { attendanceData: AttendanceData }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Classes</p>
          <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.totalClasses}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
          <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Attended</p>
          <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.totalAttended}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Missed</p>
          <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.totalClasses - attendanceData.overallMetrics.totalAttended}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
          <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Subjects</p>
          <p className="text-xl font-bold dark:text-white">{attendanceData.subjects.length}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
          <BookOpenCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Above 75%</p>
          <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.subjectsAbove75Percent}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
          <BookX className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Below 75%</p>
          <p className="text-xl font-bold dark:text-white">{attendanceData.overallMetrics.subjectsBelow75Percent}</p>
        </div>
      </div>
    </div>
  );
} 