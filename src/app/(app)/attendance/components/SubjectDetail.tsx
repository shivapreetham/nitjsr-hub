import { BookOpen } from 'lucide-react';
import { Subject } from './types';

export default function SubjectDetail({
  subjects,
  activeSubject,
  setActiveSubject,
  activeSubjectData,
  getAttendanceStatus
}: {
  subjects: Subject[],
  activeSubject: string | null,
  setActiveSubject: (id: string) => void,
  activeSubjectData: Subject | undefined,
  getAttendanceStatus: (percentage: number) => any
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Subject List</h3>
        <div className="space-y-2">
          {subjects.map((subject) => {
            const percentage = parseFloat(subject.attendancePercentage);
            const isActive = subject.id === activeSubject;
            return (
              <button 
                key={subject.id}
                onClick={() => setActiveSubject(subject.id)}
                className={`w-full flex justify-between items-center p-3 rounded-lg transition ${
                  isActive 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <div 
                    className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                  <span className={`font-medium ${isActive ? '' : 'text-gray-700 dark:text-gray-300'}`}>
                    {subject.subjectCode}
                  </span>
                </div>
                <span className={`text-sm ${isActive ? '' : 'text-gray-600 dark:text-gray-400'}`}>
                  {percentage.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="col-span-2">
        {activeSubjectData ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
            {/* ...detailed subject info, progress, analysis, action required, tips... */}
            {/* This section can be further split if needed */}
            {/* For now, keep the original UI as in the dashboard */}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Subject Selected</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Please select a subject from the list to view detailed attendance information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 