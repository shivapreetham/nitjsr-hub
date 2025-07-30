import { Doughnut, Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';
import { AttendanceData } from './types';

export default function AttendanceCharts({
  chartType,
  setChartType,
  overallChartData,
  subjectComparisonData,
  isDarkTheme,
  attendanceData,
  getAttendanceStatus
}: {
  chartType: 'doughnut' | 'bar' | 'line',
  setChartType: (type: 'doughnut' | 'bar' | 'line') => void,
  overallChartData: any,
  subjectComparisonData: any,
  isDarkTheme: boolean,
  attendanceData: AttendanceData,
  getAttendanceStatus: (percentage: number) => any
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Overall Attendance</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setChartType("doughnut")}
            className={`p-1.5 rounded ${chartType === 'doughnut' 
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            <span className="sr-only">Doughnut Chart</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          </button>
          <button 
            onClick={() => setChartType("bar")}
            className={`p-1.5 rounded ${chartType === 'bar' 
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            <BarChart3 size={16} />
          </button>
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <div style={{ width: '100%', height: chartType === 'doughnut' ? '180px' : '220px' }}>
          {chartType === 'doughnut' ? (
            <Doughnut 
              data={overallChartData} 
              options={{
                cutout: '70%',
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw as number;
                        const total = attendanceData.overallMetrics.totalClasses;
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <Bar 
              data={subjectComparisonData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: {
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    }
                  },
                  y: {
                    grid: { display: false },
                    ticks: {
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: true,
                    labels: {
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    }
                  },
                  tooltip: {
                    backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                    bodyColor: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                  }
                },
              }}
            />
          )}
        </div>
      </div>
      <div className="text-center">
        <div className={`text-4xl font-bold ${getAttendanceStatus(attendanceData.overallMetrics.overallPercentage).color}`}>
          {attendanceData.overallMetrics.overallPercentage.toFixed(1)}%
        </div>
        <p className={`text-sm font-medium mt-1 ${getAttendanceStatus(attendanceData.overallMetrics.overallPercentage).color}`}>
          {getAttendanceStatus(attendanceData.overallMetrics.overallPercentage).message}
        </p>
      </div>
      <div className="mt-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Attended</span>
        </div>
        <span className="text-sm font-medium dark:text-gray-300">
          {attendanceData.overallMetrics.totalAttended} Classes ({Math.round((attendanceData.overallMetrics.totalAttended / attendanceData.overallMetrics.totalClasses) * 100)}%)
        </span>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Missed</span>
        </div>
        <span className="text-sm font-medium dark:text-gray-300">
          {attendanceData.overallMetrics.totalClasses - attendanceData.overallMetrics.totalAttended} Classes ({Math.round(((attendanceData.overallMetrics.totalClasses - attendanceData.overallMetrics.totalAttended) / attendanceData.overallMetrics.totalClasses) * 100)}%)
        </span>
      </div>
    </div>
  );
} 