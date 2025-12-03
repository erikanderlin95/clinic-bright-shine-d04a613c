import { useState, DragEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DoctorShift {
  id: string;
  doctorNames: string[];
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  serviceType?: string;
}

interface WeeklyCalendarViewProps {
  shifts: DoctorShift[];
  onShiftMove: (shiftId: string, newDay: string) => void;
  onShiftClick: (shift: DoctorShift) => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00",
];

// Color palette for different doctors
const DOCTOR_COLORS: Record<string, string> = {};
const COLOR_PALETTE = [
  "bg-primary/20 border-primary/40 text-primary",
  "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
  "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
  "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300",
  "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300",
  "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-300",
];

let colorIndex = 0;
const getDoctorColor = (doctorName: string) => {
  if (!DOCTOR_COLORS[doctorName]) {
    DOCTOR_COLORS[doctorName] = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
    colorIndex++;
  }
  return DOCTOR_COLORS[doctorName];
};

export const WeeklyCalendarView = ({
  shifts,
  onShiftMove,
  onShiftClick,
}: WeeklyCalendarViewProps) => {
  const [draggedShift, setDraggedShift] = useState<DoctorShift | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const getShiftsForDay = (day: string) => {
    return shifts.filter((shift) => shift.dayOfWeek === day);
  };

  const getShiftPosition = (shift: DoctorShift) => {
    const startHour = parseInt(shift.startTime.split(":")[0]);
    const endHour = parseInt(shift.endTime.split(":")[0]);
    const startIndex = TIME_SLOTS.findIndex((t) => parseInt(t.split(":")[0]) === startHour);
    const endIndex = TIME_SLOTS.findIndex((t) => parseInt(t.split(":")[0]) === endHour);
    
    const top = Math.max(0, startIndex) * 48; // 48px per hour slot
    const height = Math.max(1, (endIndex - startIndex)) * 48;
    
    return { top, height };
  };

  const handleDragStart = (e: DragEvent, shift: DoctorShift) => {
    setDraggedShift(shift);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedShift(null);
    setDragOverDay(null);
  };

  const handleDragOver = (e: DragEvent, day: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDay(day);
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };

  const handleDrop = (e: DragEvent, day: string) => {
    e.preventDefault();
    if (draggedShift && draggedShift.dayOfWeek !== day) {
      onShiftMove(draggedShift.id, day);
    }
    setDraggedShift(null);
    setDragOverDay(null);
  };

  return (
    <Card className="shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b bg-muted/50">
              <div className="p-3 text-xs font-medium text-muted-foreground border-r">
                Time
              </div>
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "p-3 text-center text-sm font-medium border-r last:border-r-0",
                    day === today && "bg-primary/10 text-primary"
                  )}
                >
                  {day.slice(0, 3)}
                  {day === today && (
                    <span className="ml-1 text-xs">(Today)</span>
                  )}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-8">
              {/* Time column */}
              <div className="border-r">
                {TIME_SLOTS.map((time) => (
                  <div
                    key={time}
                    className="h-12 border-b last:border-b-0 px-2 py-1 text-xs text-muted-foreground"
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "relative border-r last:border-r-0 transition-colors",
                    dragOverDay === day && "bg-primary/5",
                    day === today && "bg-primary/5"
                  )}
                  onDragOver={(e) => handleDragOver(e, day)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  {/* Time slot lines */}
                  {TIME_SLOTS.map((time) => (
                    <div
                      key={time}
                      className="h-12 border-b last:border-b-0"
                    />
                  ))}

                  {/* Shifts */}
                  {getShiftsForDay(day).map((shift) => {
                    const { top, height } = getShiftPosition(shift);
                    return (
                      <div
                        key={shift.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, shift)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onShiftClick(shift)}
                        className={cn(
                          "absolute left-1 right-1 rounded-md border px-1.5 py-1 cursor-grab active:cursor-grabbing transition-all hover:shadow-md overflow-hidden",
                          draggedShift?.id === shift.id && "opacity-50 scale-95",
                          getDoctorColor(shift.doctorNames[0])
                        )}
                        style={{ top: `${top}px`, height: `${height}px`, minHeight: "40px" }}
                      >
                        <div className="text-xs font-semibold truncate">
                          {shift.startTime}–{shift.endTime}
                        </div>
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {shift.doctorNames.map((name, i) => (
                            <span key={i} className="text-[10px] truncate">
                              {name}{i < shift.doctorNames.length - 1 ? "," : ""}
                            </span>
                          ))}
                        </div>
                        {shift.serviceType && height > 60 && (
                          <div className="text-[10px] opacity-70 truncate mt-0.5">
                            {shift.serviceType}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
            <span className="font-medium">Tip:</span>
            <span>Drag shifts to move them to different days</span>
            <span>•</span>
            <span>Click to edit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
