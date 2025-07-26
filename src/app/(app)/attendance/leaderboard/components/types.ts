export interface Subject {
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

export interface UserData {
  id: string;
  username: string;
  email?: string;
  batch?: string | null;
  branch?: string | null;
  avatar?: string | null;
  course?: string | null;
  lastSeen: Date;
  overallPercentage: number;
  overallAttendedClasses: number;
  overallTotalClasses: number;
  subjects: Subject[];
  rank: number;
}

export interface ApiResponse {
  users: UserData[];
  metadata: {
    total: number;
    batches: string[];
    branches: string[];
    subjects: string[];
  };
} 