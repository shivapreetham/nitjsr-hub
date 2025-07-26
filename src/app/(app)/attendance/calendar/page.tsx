"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCalendarData from './hooks/useCalendarData';
import { formatDate } from './utils/calendarHelpers';
import CalendarGrid from './components/CalendarGrid';
import AttendanceDetails from './components/AttendanceDetails';

export default function AttendanceCalendar() {
  const {
    currentDate,
    calendarDays,
    loading,
    error,
    selectedDay,
    setSelectedDay,
    goToPreviousMonth,
    goToNextMonth
  } = useCalendarData();

  const handleDayClick = (day: any) => {
    setSelectedDay(day);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Calendar section (left side) */}
      <Card className="w-full lg:w-2/5 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg font-medium">Attendance Calendar</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={goToPreviousMonth}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="font-medium text-sm px-2 text-center">
                {formatDate(currentDate)}
              </div>
              <button
                onClick={goToNextMonth}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Calendar legend */}
          <div className="flex justify-end gap-3 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Full</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Partial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Absent</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CalendarGrid
            calendarDays={calendarDays}
            loading={loading}
            error={error}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
          />
        </CardContent>
      </Card>
      
      {/* Attendance details section (right side) */}
      <AttendanceDetails
        selectedDay={selectedDay}
        loading={loading}
        error={error}
      />
    </div>
  );
}