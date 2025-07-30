import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, AlertTriangle, CheckCircle } from 'lucide-react';
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
  // Calculate trend statistics
  const calculateTrendStats = () => {
    if (filteredTrendData.length < 2) return null;
    
    const recent = filteredTrendData[filteredTrendData.length - 1]?.overallPercentage || 0;
    const previous = filteredTrendData[filteredTrendData.length - 2]?.overallPercentage || 0;
    const change = recent - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;
    
    return {
      current: recent,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const trendStats = calculateTrendStats();

  return (
    <div className="space-y-6">
      {/* Main Chart */}
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
      </div>

      {/* Trend Analysis */}
      {trendStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Current Performance</h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {trendStats.current.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current attendance</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Trend Change</h4>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 flex items-center justify-center ${
                trendStats.trend === 'up' ? 'text-green-600' : 
                trendStats.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trendStats.trend === 'up' ? <TrendingUp className="h-6 w-6 mr-1" /> :
                 trendStats.trend === 'down' ? <TrendingDown className="h-6 w-6 mr-1" /> :
                 <Minus className="h-6 w-6 mr-1" />}
                {Math.abs(trendStats.change).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {trendStats.trend === 'up' ? 'Improving' : 
                 trendStats.trend === 'down' ? 'Declining' : 'Stable'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recommendations</h4>
            <div className="space-y-2">
              {trendStats.trend === 'up' ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Keep up the good work!</span>
                </div>
              ) : trendStats.trend === 'down' ? (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Focus on improving attendance</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-600">
                  <Minus className="h-4 w-4 mr-2" />
                  <span className="text-sm">Maintain current level</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subject-wise Trends Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-800 p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Subject-wise Trends</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Current %</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Trend</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.subjects.map((subject) => {
                const percentage = parseFloat(subject.attendancePercentage);
                const isAbove75 = subject.isAbove75;
                return (
                  <tr key={subject.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{subject.subjectName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{subject.subjectCode}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        percentage >= 90 ? 'text-green-600' : 
                        percentage >= 75 ? 'text-blue-600' : 
                        percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Stable</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isAbove75 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {isAbove75 ? 'Good' : 'At Risk'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => {
                          setActiveSubject(subject.id);
                          setViewMode('detailed');
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 