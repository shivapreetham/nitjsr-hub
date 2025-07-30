import { Info, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDay } from './types';

interface AttendanceDetailsProps {
  selectedDay: CalendarDay | null;
  loading: boolean;
  error: string | null;
}

export default function AttendanceDetails({
  selectedDay,
  loading,
  error
}: AttendanceDetailsProps) {
  if (loading) {
    return (
      <Card className="w-full lg:w-3/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Attendance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={`row-${i}`} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full lg:w-3/5 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Attendance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <div className="text-red-500 mb-2 text-sm">{error}</div>
            <p className="text-gray-500 text-sm">Unable to fetch attendance data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full lg:w-3/5 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Attendance Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDay && selectedDay.attendanceData?.dailyAttendance ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-medium text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                {selectedDay.date.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            
            <div className="overflow-auto max-h-96">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="px-3 py-2 text-left text-xs font-medium rounded-l-md">Subject</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Faculty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium rounded-r-md">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedDay.attendanceData.dailyAttendance.subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="font-medium text-sm">{subject.subjectName}</div>
                        <div className="text-xs text-gray-500">{subject.subjectCode}</div>
                      </td>
                      <td className="px-3 py-2 text-sm">{subject.facultyName}</td>
                      <td className="px-3 py-2">
                        <Badge className={`text-white ${
                          subject.attendedClasses === subject.totalClasses ? "bg-green-500" : 
                          subject.attendedClasses > 0 ? "bg-yellow-500" : "bg-red-500"
                        }`}>
                          {subject.attendedClasses}/{subject.totalClasses}
                          {' '}
                          ({((subject.attendedClasses / subject.totalClasses) * 100).toFixed(0)}%)
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Summary section */}
            {selectedDay.attendanceData.dailyAttendance.subjects.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-xs font-medium text-gray-500 mb-2">DAILY SUMMARY</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <div className="text-xs text-gray-500">Total Classes</div>
                    <div className="text-lg font-medium">{selectedDay.attendanceData.dailyAttendance.subjects.length}</div>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <div className="text-xs text-gray-500">Attended</div>
                    <div className="text-lg font-medium text-green-600">
                      {selectedDay.attendanceData.dailyAttendance.subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0)}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <div className="text-xs text-gray-500">Missed</div>
                    <div className="text-lg font-medium text-red-600">
                      {selectedDay.attendanceData.dailyAttendance.subjects.reduce((sum, subject) => sum + (subject.totalClasses - subject.attendedClasses), 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-400">Select a date from the calendar to view attendance details.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 