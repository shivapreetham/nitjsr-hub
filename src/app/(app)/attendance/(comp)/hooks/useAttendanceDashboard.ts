import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { AttendanceData } from '../(comp)/components/types';
import { getAttendanceStatus } from '../utils/attendanceHelpers';

export default function useAttendanceDashboard() {
  const { theme } = useTheme();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [chartType, setChartType] = useState<"doughnut" | "bar" | "line">("doughnut");
  const [viewMode, setViewMode] = useState<"overview" | "detailed" | "trends">("overview");
  const [filterPeriod, setFilterPeriod] = useState<"week" | "month" | "semester">("month");

  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/attendance/current`);
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await res.json();
        setAttendanceData(data);
        if (data.subjects && data.subjects.length > 0) {
          setActiveSubject(data.subjects[0].id);
        }
      } catch (err) {
        setError("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const filteredTrendData = useMemo(() => {
    if (!attendanceData?.attendanceTrend) return [];
    const now = new Date();
    const filterDate = new Date();
    if (filterPeriod === "week") {
      filterDate.setDate(now.getDate() - 7);
    } else if (filterPeriod === "month") {
      filterDate.setMonth(now.getMonth() - 1);
    } else {
      filterDate.setMonth(now.getMonth() - 6);
    }
    return attendanceData.attendanceTrend
      .filter(item => new Date(item.date) >= filterDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [attendanceData?.attendanceTrend, filterPeriod]);

  const activeSubjectData = attendanceData?.subjects.find(
    (subject) => subject.id === activeSubject
  );

  const overallChartData = attendanceData ? {
    labels: ["Attended", "Missed"],
    datasets: [
      {
        data: [
          attendanceData.overallMetrics.totalAttended,
          attendanceData.overallMetrics.totalClasses - attendanceData.overallMetrics.totalAttended,
        ],
        backgroundColor: ["#4ade80", "#f87171"],
        borderColor: ["#22c55e", "#ef4444"],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  } : undefined;

  const subjectComparisonData = attendanceData ? {
    labels: attendanceData.subjects.map(subj => subj.subjectCode),
    datasets: [
      {
        label: 'Attendance %',
        data: attendanceData.subjects.map(subj => parseFloat(subj.attendancePercentage)),
        backgroundColor: attendanceData.subjects.map(subj => {
          const percentage = parseFloat(subj.attendancePercentage);
          if (percentage >= 90) return isDarkTheme ? 'rgba(74, 222, 128, 0.8)' : 'rgba(22, 163, 74, 0.7)';
          if (percentage >= 75) return isDarkTheme ? 'rgba(96, 165, 250, 0.8)' : 'rgba(37, 99, 235, 0.7)';
          if (percentage >= 60) return isDarkTheme ? 'rgba(250, 204, 21, 0.8)' : 'rgba(202, 138, 4, 0.7)';
          return isDarkTheme ? 'rgba(248, 113, 113, 0.8)' : 'rgba(220, 38, 38, 0.7)';
        }),
        borderWidth: 1,
      },
    ],
  } : undefined;

  const attendanceTrendData = attendanceData ? {
    labels: filteredTrendData.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Attendance %',
        data: filteredTrendData.map(item => item.percentage),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
      },
      {
        label: 'Target (75%)',
        data: Array(filteredTrendData.length).fill(75),
        borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }
    ],
  } : undefined;

  const displayedSubjects = attendanceData ? (
    showAllSubjects 
      ? attendanceData.subjects 
      : attendanceData.subjects.filter(s => !s.isAbove75)
  ) : [];

  return {
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
  };
} 