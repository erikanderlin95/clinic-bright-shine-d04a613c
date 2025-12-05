import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Appointment {
  id: string;
  doctor_id: string | null;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: "scheduled" | "confirmed" | "arrived" | "completed" | "cancelled" | "no-show";
  notes: string | null;
  created_at: string;
  updated_at: string;
  doctor?: {
    id: string;
    name: string;
  } | null;
}

export type AppointmentInsert = {
  doctor_id?: string | null;
  patient_name: string;
  patient_phone: string;
  patient_email?: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes?: number;
  status?: Appointment["status"];
  notes?: string | null;
};

export type AppointmentUpdate = Partial<AppointmentInsert>;

export const useAppointments = (dateFilter?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["appointments", dateFilter],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          doctor:doctor_profiles(id, name)
        `)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (dateFilter) {
        query = query.eq("appointment_date", dateFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Appointment[];
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert(appointment)
        .select(`
          *,
          doctor:doctor_profiles(id, name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Success", description: "Appointment booked." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AppointmentUpdate }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          doctor:doctor_profiles(id, name)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Success", description: "Appointment updated." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Success", description: "Appointment deleted." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
