import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDoctorsTool from "./tools/list-doctors";
import listAppointmentsTool from "./tools/list-appointments";
import createAppointmentTool from "./tools/create-appointment";
import listDoctorShiftsTool from "./tools/list-doctor-shifts";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "clinicq-staff-dashboard",
  title: "ClinicQ Staff Dashboard",
  version: "0.1.0",
  instructions:
    "Tools for the ClinicQ staff dashboard. Read the doctor roster and shift schedule, list clinic appointments, and book new appointments. All calls act as the signed-in clinic staff user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listDoctorsTool, listDoctorShiftsTool, listAppointmentsTool, createAppointmentTool],
});
