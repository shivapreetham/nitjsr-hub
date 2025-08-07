export interface Subject {
  id: string;
  slNo: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  presentTotal: string;
  attendancePercentage: string;
  attendedClasses: number;
  totalClasses: number;
  isAbove75: boolean;
  classesNeeded: number;
  classesCanSkip: number;
}

export interface UserInfo {
  name: string;
  email: string;
  image: string | null;
  department: string | null;
  semester: string | null;
  registrationNumber: string | null;
  course: string | null;
  batch: string | null;
  branch: string | null;
  lastSeen: Date;
}

export interface OverallMetrics {
  totalAttended: number;
  totalClasses: number;
  overallPercentage: number;
  subjectsAbove75Percent: number;
  subjectsBelow75Percent: number;
}

export interface SubjectMetric {
  id: string;
  subjectCode: string;
  subjectName: string;
  subjectProfessor: string;
  attendedClasses: number;
  totalClasses: number;
  attendancePercentage: number;
  isAbove75: boolean;
  classesNeeded: number;
  classesCanSkip: number;
}

export interface TrendPoint {
  date: string;
  percentage: number;
  attended: number;
  total: number;
}

export interface UserStats {
  loginStreak: number;
  loginDays: number;
  honorScore: number;
  activeStatus: boolean;
}

export interface AttendanceData {
  id: string;
  userId: string;
  date: string;
  subjects: Subject[];
  user: UserInfo;
  overallMetrics: OverallMetrics;
  subjectMetrics: SubjectMetric[];
  attendanceTrend: TrendPoint[];
  userStats: UserStats;
  lastUpdated: string;
} 