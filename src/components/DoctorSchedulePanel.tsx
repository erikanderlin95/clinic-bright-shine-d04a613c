import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Calendar, Clock, User, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DoctorShift {
  id: string;
  doctorName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  serviceType?: string;
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

const SERVICE_TYPES = [
  "General Consultation",
  "Specialist Consultation",
  "Follow-up",
  "Vaccination",
  "Health Screening",
];

export const DoctorSchedulePanel = () => {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<DoctorShift[]>([
    {
      id: "1",
      doctorName: "Dr Tan",
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "17:00",
      serviceType: "General Consultation",
    },
    {
      id: "2",
      doctorName: "Dr Tan",
      dayOfWeek: "Thursday",
      startTime: "12:00",
      endTime: "20:00",
      serviceType: "Specialist Consultation",
    },
    {
      id: "3",
      doctorName: "Dr Lim",
      dayOfWeek: "Tuesday",
      startTime: "10:00",
      endTime: "18:00",
      serviceType: "General Consultation",
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<DoctorShift, "id">>({
    doctorName: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    serviceType: "",
  });

  const resetForm = () => {
    setFormData({
      doctorName: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      serviceType: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.doctorName || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      setShifts((prev) =>
        prev.map((shift) =>
          shift.id === editingId ? { ...formData, id: editingId } : shift
        )
      );
      toast({
        title: "Shift updated",
        description: `Updated shift for ${formData.doctorName}.`,
      });
    } else {
      const newShift: DoctorShift = {
        ...formData,
        id: Date.now().toString(),
      };
      setShifts((prev) => [...prev, newShift]);
      toast({
        title: "Shift added",
        description: `Added new shift for ${formData.doctorName}.`,
      });
    }

    resetForm();
  };

  const handleEdit = (shift: DoctorShift) => {
    setFormData({
      doctorName: shift.doctorName,
      dayOfWeek: shift.dayOfWeek,
      startTime: shift.startTime,
      endTime: shift.endTime,
      serviceType: shift.serviceType || "",
    });
    setEditingId(shift.id);
  };

  const handleDelete = (id: string) => {
    const shift = shifts.find((s) => s.id === id);
    setShifts((prev) => prev.filter((s) => s.id !== id));
    toast({
      title: "Shift deleted",
      description: `Removed shift for ${shift?.doctorName}.`,
    });
  };

  // Get today's day name
  const getTodayShift = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return shifts.find((shift) => shift.dayOfWeek === today);
  };

  // Get next availability if no shift today
  const getNextAvailability = () => {
    const today = new Date();
    const todayIndex = today.getDay();
    const dayIndexMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    let nextShift: DoctorShift | null = null;
    let minDaysAway = 8;

    shifts.forEach((shift) => {
      const shiftDayIndex = dayIndexMap[shift.dayOfWeek];
      let daysAway = shiftDayIndex - todayIndex;
      if (daysAway <= 0) daysAway += 7;

      if (daysAway < minDaysAway) {
        minDaysAway = daysAway;
        nextShift = shift;
      }
    });

    return nextShift;
  };

  const todayShift = getTodayShift();
  const nextShift = !todayShift ? getNextAvailability() : null;

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            {editingId ? "Edit Shift" : "Add Doctor Shift"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor Name *</Label>
                <Input
                  id="doctorName"
                  placeholder="e.g. Dr Tan"
                  value={formData.doctorName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, doctorName: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week *</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, dayOfWeek: value }))
                  }
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, serviceType: value }))
                  }
                >
                  <SelectTrigger id="serviceType">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                {editingId ? "Update Shift" : "Add Shift"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Schedule List Table */}
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Doctor Shifts ({shifts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No shifts scheduled. Add a shift above to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{shift.doctorName}</TableCell>
                      <TableCell>{shift.dayOfWeek}</TableCell>
                      <TableCell>{shift.startTime}</TableCell>
                      <TableCell>{shift.endTime}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {shift.serviceType || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(shift)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(shift.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marketplace Display Preview */}
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Marketplace Display Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              How it appears on your public clinic card
            </p>
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  {todayShift ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        On Shift Today
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {todayShift.doctorName} ({todayShift.startTime}–{todayShift.endTime})
                      </p>
                    </>
                  ) : nextShift ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        Next Availability
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {nextShift.dayOfWeek.slice(0, 3)} {nextShift.startTime}–{nextShift.endTime} ({nextShift.doctorName})
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        Doctor Schedule
                      </p>
                      <p className="text-sm text-muted-foreground">
                        No shifts scheduled
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
