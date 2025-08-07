import { useState, useEffect } from "react";
import { AttendanceData, CalendarDay } from '../components/types';

export default function useCalendarData() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Fetch attendance data for the current month
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        
        const response = await fetch(`/api/attendance/calendar?year=${year}&month=${month}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }
        
        const data = await response.json();
        setAttendanceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching attendance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [currentDate]);

  // Generate calendar days for the current month
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // First day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      // Last day of the month
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      // Day of the week for the first day (0 = Sunday, 6 = Saturday)
      const firstDayWeekday = firstDayOfMonth.getDay();
      
      const days: CalendarDay[] = [];
      
      // Add days from previous month to fill the first week
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({
          date,
          isCurrentMonth: false,
          attendanceData: attendanceData ? mapAttendanceDataToDate(date) : undefined,
        });
      }
      
      // Add days of the current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          date,
          isCurrentMonth: true,
          attendanceData: attendanceData ? mapAttendanceDataToDate(date) : undefined,
        });
      }
      
      // Add days from next month to complete the last week
      const remainingDays = 7 - (days.length % 7);
      if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
          const date = new Date(year, month + 1, i);
          days.push({
            date,
            isCurrentMonth: false,
            attendanceData: attendanceData ? mapAttendanceDataToDate(date) : undefined,
          });
        }
      }
      
      return days;
    };
    
    // Map attendance data to a specific date
    const mapAttendanceDataToDate = (date: Date) => {
      if (!attendanceData) return undefined;
      
      const dateString = date.toISOString().split('T')[0];
      
      const attendance = attendanceData.attendanceRecords.find(
        record => new Date(record.date).toISOString().split('T')[0] === dateString
      );
      
      const dailyAttendance = attendanceData.dailyAttendanceRecords.find(
        record => new Date(record.date).toISOString().split('T')[0] === dateString
      );
      
      if (!attendance && !dailyAttendance) return undefined;
      
      return {
        attendance,
        dailyAttendance,
      };
    };
    
    setCalendarDays(generateCalendarDays());
  }, [attendanceData, currentDate]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return {
    currentDate,
    calendarDays,
    attendanceData,
    loading,
    error,
    selectedDay,
    setSelectedDay,
    goToPreviousMonth,
    goToNextMonth
  };
} 