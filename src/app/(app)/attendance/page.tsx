
"use client";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { 
   BookOpen, UserCheck, Calendar, Clock, AlertCircle, 
  CheckCircle, XCircle, ChevronDown, BarChart3, ArrowUpRight, 
  Award, CalendarClock, TrendingUp, BookOpenCheck, BookX, Flame
} from "lucide-react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Move all interfaces to a new file: types.ts
import {
  Subject,
  UserInfo,
  OverallMetrics,
  SubjectMetric,
  TrendPoint,
  UserStats,
  AttendanceData
} from './(comp)/components/types';

// Move all helper functions to a new file: utils/attendanceHelpers.ts
import { getAttendanceStatus, formatDate } from './(comp)/utils/attendanceHelpers';

// Move data fetching and state logic to a custom hook: hooks/useAttendanceDashboard.ts
import useAttendanceDashboard from './(comp)/hooks/useAttendanceDashboard';

// Move chart data preparation to a new file: components/AttendanceCharts.tsx
import AttendanceCharts from './(comp)/components/AttendanceCharts';

// Move overview cards to a new file: components/AttendanceStatusCards.tsx
import AttendanceStatusCards from './(comp)/components/AttendanceStatusCards';

// Move user stats banner to a new file: components/UserStatsBanner.tsx
import UserStatsBanner from './(comp)/components/UserStatsBanner';

// Move subject list to a new file: components/SubjectList.tsx
import SubjectList from './(comp)/components/SubjectList';

// Move subject detail to a new file: components/SubjectDetail.tsx
import SubjectDetail from './(comp)/components/SubjectDetail';

// Move trends view to a new file: components/AttendanceTrends.tsx
import AttendanceTrends from './(comp)/components/AttendanceTrends';

// Move loading and error UI to new files: components/Loading.tsx, components/Error.tsx
import Loading from './(comp)/components/Loading';
import Error from './(comp)/components/Error';

export default function AttendanceDashboard() {
  const {
    attendanceData,
    loading,
    error,
    activeSubject,
    setActiveSubject,
    showAllSubjects,
    setShowAllSubjects,
    chartType,
    setChartType,
    viewMode,
    setViewMode,
    filterPeriod,
    setFilterPeriod,
    isDarkTheme,
    filteredTrendData,
    activeSubjectData,
    overallChartData,
    subjectComparisonData,
    attendanceTrendData,
    displayedSubjects
  } = useAttendanceDashboard();

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;
  if (!attendanceData) return <Error error="No attendance data is available for your account. Please contact your administrator." />;

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <header className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
  {/* Attendance Dashboard Info */}
  <div>
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
      Attendance Dashboard
    </h1>
    <p className="text-sm sm:text-base text-muted-foreground mt-2">
      {attendanceData.user.name} • {attendanceData.user.branch || 'No Department'} • {attendanceData.user.batch ? `Semester ${attendanceData.user.batch}` : 'No Semester'}
    </p>
  </div>

  {/* Button Group */}
  <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
    {/* View Mode Buttons */}
    <div className="flex bg-muted rounded-lg p-1">
      <button 
        onClick={() => setViewMode("overview")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
          viewMode === "overview"
            ? "bg-card text-foreground shadow"
            : "text-muted-foreground"
        }`}
      >
        Overview
      </button>
      <button 
        onClick={() => setViewMode("detailed")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
          viewMode === "detailed"
            ? "bg-card text-foreground shadow"
            : "text-muted-foreground"
        }`}
      >
        Detailed
      </button>
      <button 
        onClick={() => setViewMode("trends")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
          viewMode === "trends"
            ? "bg-card text-foreground shadow"
            : "text-muted-foreground"
        }`}
      >
        Trends
      </button>
    </div>
    {/* Theme Toggle Button */}
    {/* Add your theme toggle here if needed */}
  </div>
</div>

          {/* Last updated banner */}
          <div className="mt-4 flex justify-between items-center bg-primary/10 rounded-lg px-4 py-2">
            <div className="flex items-center">
              <CalendarClock className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm text-primary">
                Last Updated: {formatDate(attendanceData.lastUpdated)}
              </span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-primary hover:underline"
            >
              Refresh
            </button>
          </div>
        </header>
        <AttendanceStatusCards attendanceData={attendanceData} />
        <UserStatsBanner userStats={attendanceData.userStats} />
        {viewMode === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AttendanceCharts
                chartType={chartType}
                setChartType={setChartType}
                overallChartData={overallChartData}
                subjectComparisonData={subjectComparisonData}
                isDarkTheme={isDarkTheme}
                attendanceData={attendanceData}
                getAttendanceStatus={getAttendanceStatus}
              />
            </div>
            <div className="lg:col-span-2">
              <SubjectList
                displayedSubjects={displayedSubjects}
                showAllSubjects={showAllSubjects}
                setShowAllSubjects={setShowAllSubjects}
                setActiveSubject={setActiveSubject}
                setViewMode={setViewMode}
                getAttendanceStatus={getAttendanceStatus}
              />
            </div>
          </div>
        )}
        {viewMode === "detailed" && (
          <SubjectDetail
            subjects={attendanceData.subjects}
            activeSubject={activeSubject}
            setActiveSubject={setActiveSubject}
            activeSubjectData={activeSubjectData}
            getAttendanceStatus={getAttendanceStatus}
          />
        )}
        {viewMode === "trends" && (
          <AttendanceTrends
            filterPeriod={filterPeriod}
            setFilterPeriod={setFilterPeriod}
            filteredTrendData={filteredTrendData}
            attendanceTrendData={attendanceTrendData}
            isDarkTheme={isDarkTheme}
            attendanceData={attendanceData}
            setActiveSubject={setActiveSubject}
            setViewMode={setViewMode}
          />
        )}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Student Attendance System. All rights reserved.</p>
          <p className="mt-1">Last login: {new Date(attendanceData.user.lastSeen).toLocaleString()}</p>
        </footer>
      </div>
    </div>
  );
}