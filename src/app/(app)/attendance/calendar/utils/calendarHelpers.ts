import { CalendarDay } from '../components/types';

// Format date for display
export const formatDate = (date: Date) => {
  return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
};

// Get attendance status for a day
export const getAttendanceStatus = (day: CalendarDay) => {
  if (!day.attendanceData) return null;
  
  const { dailyAttendance } = day.attendanceData;
  
  if (!dailyAttendance || !dailyAttendance.subjects.length) return null;
  
  // Calculate overall attendance for the day
  const totalAttended = dailyAttendance.subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0);
  const totalClasses = dailyAttendance.subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
  
  if (totalClasses === 0) return null;
  
  const attendancePercentage = (totalAttended / totalClasses) * 100;
  
  if (attendancePercentage === 100) return "full";
  if (attendancePercentage > 0) return "partial";
  return "absent";
};

// Get today's date for highlighting current day
export const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// Get class count for a day
export const getClassCount = (day: CalendarDay) => {
  if (!day.attendanceData?.dailyAttendance) return 0;
  return day.attendanceData.dailyAttendance.subjects.length;
};

// Get week days header
export const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; 