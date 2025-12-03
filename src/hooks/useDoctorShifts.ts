import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DoctorShift {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  service_type: string | null;
  created_at: string;
  updated_at: string;
  doctors: {
    id: string;
    name: string;
  }[];
}

export interface DoctorShiftInsert {
  day_of_week: string;
  start_time: string;
  end_time: string;
  service_type?: string | null;
  doctor_ids: string[];
}

export const useDoctorShifts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shifts = [], isLoading, error } = useQuery({
    queryKey: ["doctor-shifts"],
    queryFn: async () => {
      // Fetch shifts with their assigned doctors
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("doctor_shifts")
        .select(`
          *,
          doctor_shift_assignments (
            doctor_id,
            doctor_profiles (
              id,
              name
            )
          )
        `)
        .order("day_of_week");

      if (shiftsError) throw shiftsError;

      // Transform data to flatten doctors array
      return (shiftsData || []).map((shift: any) => ({
        id: shift.id,
        day_of_week: shift.day_of_week,
        start_time: shift.start_time,
        end_time: shift.end_time,
        service_type: shift.service_type,
        created_at: shift.created_at,
        updated_at: shift.updated_at,
        doctors: (shift.doctor_shift_assignments || [])
          .map((a: any) => a.doctor_profiles)
          .filter(Boolean),
      })) as DoctorShift[];
    },
  });

  const createShift = useMutation({
    mutationFn: async (data: DoctorShiftInsert) => {
      // Create the shift
      const { data: shift, error: shiftError } = await supabase
        .from("doctor_shifts")
        .insert({
          day_of_week: data.day_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          service_type: data.service_type || null,
        })
        .select()
        .single();

      if (shiftError) throw shiftError;

      // Create doctor assignments
      if (data.doctor_ids.length > 0) {
        const assignments = data.doctor_ids.map((doctor_id) => ({
          shift_id: shift.id,
          doctor_id,
        }));

        const { error: assignmentError } = await supabase
          .from("doctor_shift_assignments")
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      return shift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-shifts"] });
      toast({ title: "Success", description: "Shift created." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateShift = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DoctorShiftInsert }) => {
      // Update the shift
      const { error: shiftError } = await supabase
        .from("doctor_shifts")
        .update({
          day_of_week: data.day_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          service_type: data.service_type || null,
        })
        .eq("id", id);

      if (shiftError) throw shiftError;

      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from("doctor_shift_assignments")
        .delete()
        .eq("shift_id", id);

      if (deleteError) throw deleteError;

      // Create new assignments
      if (data.doctor_ids.length > 0) {
        const assignments = data.doctor_ids.map((doctor_id) => ({
          shift_id: id,
          doctor_id,
        }));

        const { error: assignmentError } = await supabase
          .from("doctor_shift_assignments")
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-shifts"] });
      toast({ title: "Success", description: "Shift updated." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteShift = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doctor_shifts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-shifts"] });
      toast({ title: "Success", description: "Shift deleted." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const moveShift = useMutation({
    mutationFn: async ({ id, day_of_week }: { id: string; day_of_week: string }) => {
      const { error } = await supabase
        .from("doctor_shifts")
        .update({ day_of_week })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-shifts"] });
      toast({ title: "Success", description: "Shift moved." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    shifts,
    isLoading,
    error,
    createShift,
    updateShift,
    deleteShift,
    moveShift,
  };
};
