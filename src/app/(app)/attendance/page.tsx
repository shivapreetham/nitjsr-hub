
"use client";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { 
   BookOpen, UserCheck, Calendar, Clock, AlertCircle, 
  CheckCircle, XCircle, ChevronDown, BarChart3, ArrowUpRight, 
  Award, CalendarClock, TrendingUp, BookOpenCheck, BookX, Flame, Settings
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

function CredentialsRequired({ onAddCredentials }: { onAddCredentials: () => void }) {
  const [isStartingScraping, setIsStartingScraping] = useState(false);
  const { data: session } = useSession();

  const handleStartScraping = async () => {
    try {
      setIsStartingScraping(true);
      const response = await fetch('/api/start-scraping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start scraping');
      }

      // Show success message or handle response
      alert('Scraping request sent successfully!');
    } catch (error) {
      console.error('Error starting scraping:', error);
      alert('Failed to start scraping. Please try again.');
    } finally {
      setIsStartingScraping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full p-4">
              <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              NIT Credentials Required
            </h2>
            <p className="text-muted-foreground">
              To access attendance features, you need to add your NIT attendance portal credentials to your profile.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onAddCredentials}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Add Credentials in Profile
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <button
              onClick={handleStartScraping}
              disabled={isStartingScraping}
              className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStartingScraping ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-foreground"></div>
                  Starting Scraping...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Start Scraping Process
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Note:</strong> The scraping process will collect your attendance data using your NIT credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AttendanceDashboard() {
  const { data: session, status } = useSession();
  const [showAddCredentials, setShowAddCredentials] = useState(false);
  
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

  // Check if user has NIT credentials
  if (status === "loading") return <Loading />;
  
  if (session && !session.user.hasNitCredentials) {
    return (
      <CredentialsRequired 
        onAddCredentials={() => {
          // Navigate to profile page or show credentials modal
          window.location.href = '/profile';
        }}
      />
    );
  }

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