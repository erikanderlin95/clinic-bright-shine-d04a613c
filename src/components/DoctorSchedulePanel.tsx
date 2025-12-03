import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Pencil, Trash2, Calendar, Clock, User, Eye, X, CalendarDays, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WeeklyCalendarView } from "./WeeklyCalendarView";

interface DoctorShift {
  id: string;
  doctorNames: string[];
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
      doctorNames: ["Dr Tan", "Dr Wong"],
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "17:00",
      serviceType: "General Consultation",
    },
    {
      id: "2",
      doctorNames: ["Dr Tan"],
      dayOfWeek: "Thursday",
      startTime: "12:00",
      endTime: "20:00",
      serviceType: "Specialist Consultation",
    },
    {
      id: "3",
      doctorNames: ["Dr Lim", "Dr Chen"],
      dayOfWeek: "Tuesday",
      startTime: "10:00",
      endTime: "18:00",
      serviceType: "General Consultation",
    },
    {
      id: "4",
      doctorNames: ["Dr Wong"],
      dayOfWeek: "Wednesday",
      startTime: "08:00",
      endTime: "14:00",
      serviceType: "Health Screening",
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [doctorInput, setDoctorInput] = useState("");
  const [formData, setFormData] = useState<Omit<DoctorShift, "id">>({
    doctorNames: [],
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    serviceType: "",
  });

  const resetForm = () => {
    setFormData({
      doctorNames: [],
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      serviceType: "",
    });
    setDoctorInput("");
    setEditingId(null);
  };

  const handleAddDoctor = () => {
    const trimmed = doctorInput.trim();
    if (trimmed && !formData.doctorNames.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        doctorNames: [...prev.doctorNames, trimmed],
      }));
      setDoctorInput("");
    }
  };

  const handleRemoveDoctor = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      doctorNames: prev.doctorNames.filter((n) => n !== name),
    }));
  };

  const handleDoctorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDoctor();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.doctorNames.length === 0 || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields including at least one doctor.",
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
        description: `Updated shift for ${formData.doctorNames.join(", ")}.`,
      });
    } else {
      const newShift: DoctorShift = {
        ...formData,
        id: Date.now().toString(),
      };
      setShifts((prev) => [...prev, newShift]);
      toast({
        title: "Shift added",
        description: `Added new shift for ${formData.doctorNames.join(", ")}.`,
      });
    }

    resetForm();
  };

  const handleEdit = (shift: DoctorShift) => {
    setFormData({
      doctorNames: [...shift.doctorNames],
      dayOfWeek: shift.dayOfWeek,
      startTime: shift.startTime,
      endTime: shift.endTime,
      serviceType: shift.serviceType || "",
    });
    setDoctorInput("");
    setEditingId(shift.id);
  };

  const handleDelete = (id: string) => {
    const shift = shifts.find((s) => s.id === id);
    setShifts((prev) => prev.filter((s) => s.id !== id));
    toast({
      title: "Shift deleted",
      description: `Removed shift for ${shift?.doctorNames.join(", ")}.`,
    });
  };

  const handleShiftMove = (shiftId: string, newDay: string) => {
    setShifts((prev) =>
      prev.map((shift) =>
        shift.id === shiftId ? { ...shift, dayOfWeek: newDay } : shift
      )
    );
    const shift = shifts.find((s) => s.id === shiftId);
    toast({
      title: "Shift moved",
      description: `Moved ${shift?.doctorNames.join(", ")} to ${newDay}.`,
    });
  };

  // Get all shifts for today
  const getTodayShifts = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return shifts.filter((shift) => shift.dayOfWeek === today);
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

  const todayShifts = getTodayShifts();
  const nextShift = todayShifts.length === 0 ? getNextAvailability() : null;

  // Combine all doctors on shift today with their times
  const getTodayDoctorsDisplay = () => {
    if (todayShifts.length === 0) return [];
    
    const doctorTimeMap: Record<string, string[]> = {};
    
    todayShifts.forEach((shift) => {
      const timeSlot = `${shift.startTime}–${shift.endTime}`;
      shift.doctorNames.forEach((name) => {
        if (!doctorTimeMap[name]) {
          doctorTimeMap[name] = [];
        }
        if (!doctorTimeMap[name].includes(timeSlot)) {
          doctorTimeMap[name].push(timeSlot);
        }
      });
    });

    return Object.entries(doctorTimeMap).map(([name, times]) => ({
      name,
      times: times.join(", "),
    }));
  };

  const todayDoctors = getTodayDoctorsDisplay();

  return (
    <div className="space-y-6">
      {/* View Toggle Tabs */}
      <Tabs defaultValue="calendar" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Doctor Schedule</h2>
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6 mt-0">
          <WeeklyCalendarView
            shifts={shifts}
            onShiftMove={handleShiftMove}
            onShiftClick={handleEdit}
          />
          
          {/* Compact Add Form */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4 text-primary" />
                {editingId ? "Edit Shift" : "Quick Add Shift"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                  <div className="space-y-1.5 lg:col-span-2">
                    <Label htmlFor="doctorNameCal" className="text-xs">Doctors</Label>
                    <div className="flex gap-2">
                      <Input
                        id="doctorNameCal"
                        placeholder="e.g. Dr Tan"
                        value={doctorInput}
                        onChange={(e) => setDoctorInput(e.target.value)}
                        onKeyDown={handleDoctorKeyDown}
                        className="h-9"
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={handleAddDoctor}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.doctorNames.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.doctorNames.map((name) => (
                          <Badge key={name} variant="secondary" className="gap-1 pr-1 text-xs">
                            {name}
                            <button type="button" onClick={() => handleRemoveDoctor(name)} className="ml-0.5 rounded-full p-0.5 hover:bg-muted">
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dayOfWeekCal" className="text-xs">Day</Label>
                    <Select value={formData.dayOfWeek} onValueChange={(v) => setFormData((prev) => ({ ...prev, dayOfWeek: v }))}>
                      <SelectTrigger id="dayOfWeekCal" className="h-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="startTimeCal" className="text-xs">Start</Label>
                    <Input id="startTimeCal" type="time" value={formData.startTime} onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))} className="h-9" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="endTimeCal" className="text-xs">End</Label>
                    <Input id="endTimeCal" type="time" value={formData.endTime} onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))} className="h-9" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">&nbsp;</Label>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="h-9">
                        {editingId ? "Update" : "Add"}
                      </Button>
                      {editingId && (
                        <Button type="button" variant="outline" size="sm" onClick={resetForm} className="h-9">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-6 mt-0">
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
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="doctorName">Doctors *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="doctorName"
                        placeholder="e.g. Dr Tan"
                        value={doctorInput}
                        onChange={(e) => setDoctorInput(e.target.value)}
                        onKeyDown={handleDoctorKeyDown}
                      />
                      <Button type="button" variant="secondary" onClick={handleAddDoctor}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.doctorNames.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.doctorNames.map((name) => (
                          <Badge key={name} variant="secondary" className="gap-1 pr-1">
                            {name}
                            <button type="button" onClick={() => handleRemoveDoctor(name)} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day of Week *</Label>
                    <Select value={formData.dayOfWeek} onValueChange={(v) => setFormData((prev) => ({ ...prev, dayOfWeek: v }))}>
                      <SelectTrigger id="dayOfWeek">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select value={formData.serviceType} onValueChange={(v) => setFormData((prev) => ({ ...prev, serviceType: v }))}>
                      <SelectTrigger id="serviceType">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
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
                        <TableHead>Doctors</TableHead>
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
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {shift.doctorNames.map((name) => (
                                <Badge key={name} variant="outline" className="font-medium">{name}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{shift.dayOfWeek}</TableCell>
                          <TableCell>{shift.startTime}</TableCell>
                          <TableCell>{shift.endTime}</TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">{shift.serviceType || "—"}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(shift)} className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(shift.id)} className="h-8 w-8 text-destructive hover:text-destructive">
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
        </TabsContent>
      </Tabs>

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
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  {todayDoctors.length > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">On Shift Today</p>
                      <div className="mt-1 space-y-0.5">
                        {todayDoctors.map((doc) => (
                          <p key={doc.name} className="text-sm text-muted-foreground">
                            {doc.name} ({doc.times})
                          </p>
                        ))}
                      </div>
                    </>
                  ) : nextShift ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">Next Availability</p>
                      <p className="text-sm text-muted-foreground">
                        {nextShift.dayOfWeek.slice(0, 3)} {nextShift.startTime}–{nextShift.endTime}
                      </p>
                      <p className="text-sm text-muted-foreground">{nextShift.doctorNames.join(", ")}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground">Doctor Schedule</p>
                      <p className="text-sm text-muted-foreground">No shifts scheduled</p>
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
