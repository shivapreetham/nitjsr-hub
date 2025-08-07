"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useCalendarData from './(comps)/hooks/useCalendarData';
import { formatDate } from './(comps)/utils/calendarHelpers';
import CalendarGrid from './(comps)/components/CalendarGrid';
import AttendanceDetails from './(comps)/components/AttendanceDetails';

export default function AttendanceCalendar() {
  const {
    currentDate,
    calendarDays,
    loading,
    error,
    selectedDay,
    setSelectedDay,
    goToPreviousMonth,
    goToNextMonth,
    handleDayClick,
  } = useCalendarData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar section (left side) */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Attendance Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="p-1 rounded-full hover:bg-muted"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-foreground font-medium min-w-[120px] text-center">
                  {formatDate(currentDate)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextMonth}
                  className="p-1 rounded-full hover:bg-muted"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar legend */}
            <div className="flex justify-end gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Full</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-muted-foreground">Partial</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-muted-foreground">Absent</span>
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
      </div>
      
      {/* Attendance details section (right side) */}
      <AttendanceDetails
        selectedDay={selectedDay}
        loading={loading}
        error={error}
      />
    </div>
  );
}