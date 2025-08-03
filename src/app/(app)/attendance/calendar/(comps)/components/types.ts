export interface AttendanceSubject {
  id: string;
  slNo: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  presentTotal: string;
  attendancePercentage: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  subjects: AttendanceSubject[];
}

export interface DailyAttendanceSubject {
  id: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  attendedClasses: number;
  totalClasses: number;
}

export interface DailyAttendance {
  id: string;
  userId: string;
  date: string;
  subjects: DailyAttendanceSubject[];
}

export interface AttendanceData {
  attendanceRecords: Attendance[];
  dailyAttendanceRecords: DailyAttendance[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  attendanceData?: {
    attendance?: Attendance;
    dailyAttendance?: DailyAttendance;
  };
} 