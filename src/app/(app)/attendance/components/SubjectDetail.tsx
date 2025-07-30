import { BookOpen, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
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
            {/* Subject Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {activeSubjectData.subjectName}
                </h2>
                <span className="text-sm bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300">
                  {activeSubjectData.subjectCode}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Professor: {activeSubjectData.facultyName}
              </p>
            </div>

            {/* Attendance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Classes</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {activeSubjectData.totalClasses}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attended</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {activeSubjectData.attendedClasses}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Percentage</span>
                </div>
                <p className={`text-2xl font-bold ${getAttendanceStatus(parseFloat(activeSubjectData.attendancePercentage)).color}`}>
                  {parseFloat(activeSubjectData.attendancePercentage).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {activeSubjectData.attendedClasses}/{activeSubjectData.totalClasses} classes
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    parseFloat(activeSubjectData.attendancePercentage) >= 90 ? 'bg-green-500' : 
                    parseFloat(activeSubjectData.attendancePercentage) >= 75 ? 'bg-blue-500' : 
                    parseFloat(activeSubjectData.attendancePercentage) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, parseFloat(activeSubjectData.attendancePercentage))}%` }}
                ></div>
              </div>
            </div>

            {/* Analysis and Recommendations */}
            <div className="space-y-4">
              {!activeSubjectData.isAbove75 ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Action Required</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Your attendance is below 75%. You need to attend the next{' '}
                        <span className="font-semibold">{activeSubjectData.classesNeeded}</span> classes 
                        to reach the minimum attendance requirement.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Good Standing</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your attendance is above 75%. You can skip up to{' '}
                        <span className="font-semibold">{activeSubjectData.classesCanSkip}</span> classes 
                        while maintaining the minimum attendance requirement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Tips for Improvement</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Set reminders for class schedules</li>
                      <li>• Plan your day to prioritize attendance</li>
                      <li>• Communicate with professors if you need to miss class</li>
                      <li>• Review missed material promptly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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