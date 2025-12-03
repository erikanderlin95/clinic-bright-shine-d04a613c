import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DoctorProfile {
  id: string;
  name: string;
  title: string | null;
  specialization: string | null;
  certifications: string[] | null;
  languages: string[] | null;
  years_of_experience: number | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DoctorProfileInsert = Omit<DoctorProfile, "id" | "created_at" | "updated_at">;
export type DoctorProfileUpdate = Partial<DoctorProfileInsert>;

export const useDoctorProfiles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ["doctor-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as DoctorProfile[];
    },
  });

  const createProfile = useMutation({
    mutationFn: async (profile: DoctorProfileInsert) => {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profiles"] });
      toast({ title: "Success", description: "Doctor profile created." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DoctorProfileUpdate }) => {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profiles"] });
      toast({ title: "Success", description: "Doctor profile updated." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("doctor_profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profiles"] });
      toast({ title: "Success", description: "Doctor profile deleted." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    profiles,
    isLoading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
  };
};
