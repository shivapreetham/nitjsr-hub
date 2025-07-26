import { CheckCircle, ChevronDown, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Subject } from './types';

export default function SubjectList({
  displayedSubjects,
  showAllSubjects,
  setShowAllSubjects,
  setActiveSubject,
  setViewMode,
  getAttendanceStatus
}: {
  displayedSubjects: Subject[],
  showAllSubjects: boolean,
  setShowAllSubjects: (show: boolean) => void,
  setActiveSubject: (id: string) => void,
  setViewMode: (mode: 'overview' | 'detailed' | 'trends') => void,
  getAttendanceStatus: (percentage: number) => any
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Subject Attendance</h3>
        <button 
          onClick={() => setShowAllSubjects(!showAllSubjects)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          {showAllSubjects ? "Show At Risk Only" : "Show All Subjects"}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {displayedSubjects.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h4 className="text-lg font-medium dark:text-white">All Good!</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Great job! All subjects are above 75% attendance.
            </p>
          </div>
        ) : (
          displayedSubjects.map((subject) => {
            const percentage = parseFloat(subject.attendancePercentage);
            const status = getAttendanceStatus(percentage);
            return (
              <div 
                key={subject.id}
                className={`p-4 rounded-lg ${status.bgColor} hover:bg-opacity-80 dark:hover:bg-opacity-40 transition cursor-pointer`}
                onClick={() => {
                  setActiveSubject(subject.id);
                  setViewMode('detailed');
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{subject.subjectName}</h4>
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded px-1.5 py-0.5 text-gray-700 dark:text-gray-300">
                        {subject.subjectCode}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Prof. {subject.facultyName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${status.color}`}>
                      {percentage.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {subject.attendedClasses}/{subject.totalClasses} Classes
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        percentage >= 90 ? 'bg-green-500' : 
                        percentage >= 75 ? 'bg-blue-500' : 
                        percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                </div>
                {!subject.isAbove75 && (
                  <div className="mt-3 flex items-center text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Need to attend next {subject.classesNeeded} classes to reach 75%</span>
                  </div>
                )}
                {subject.isAbove75 && subject.classesCanSkip > 0 && (
                  <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Can skip up to {subject.classesCanSkip} classes while staying above 75%</span>
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex justify-end">
                  <span className="flex items-center">
                    View Details
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 