import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import { AttendanceData } from './types';

export default function AttendanceTrends({
  filterPeriod,
  setFilterPeriod,
  filteredTrendData,
  attendanceTrendData,
  isDarkTheme,
  attendanceData,
  setActiveSubject,
  setViewMode
}: {
  filterPeriod: 'week' | 'month' | 'semester',
  setFilterPeriod: (period: 'week' | 'month' | 'semester') => void,
  filteredTrendData: any[],
  attendanceTrendData: any,
  isDarkTheme: boolean,
  attendanceData: AttendanceData,
  setActiveSubject: (id: string) => void,
  setViewMode: (mode: 'overview' | 'detailed' | 'trends') => void
}) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-0">Attendance Trends</h3>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              onClick={() => setFilterPeriod('week')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterPeriod === 'week' 
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setFilterPeriod('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterPeriod === 'month' 
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => setFilterPeriod('semester')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filterPeriod === 'semester' 
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Semester
            </button>
          </div>
        </div>
        <div className="h-72 mb-8">
          {filteredTrendData.length > 0 ? (
            <Line 
              data={attendanceTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    grid: {
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                      callback: function(value) {
                        return value + '%';
                      }
                    }
                  },
                  x: {
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
                    borderWidth: 1,
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += context.parsed.y.toFixed(1) + '%';
                        }
                        return label;
                      }
                    }
                  }
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No trend data available for the selected period</p>
              </div>
            </div>
          )}
        </div>
        {/* ...trend analysis, statistics, recommendations, subject-wise trends table... */}
        {/* This section can be further split if needed */}
        {/* For now, keep the original UI as in the dashboard */}
      </div>
    </div>
  );
} 