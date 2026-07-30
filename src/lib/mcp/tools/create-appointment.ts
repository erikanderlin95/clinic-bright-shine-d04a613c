import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_appointment",
  title: "Create appointment",
  description: "Book a new clinic appointment for a patient.",
  inputSchema: {
    patient_name: z.string().trim().min(1).describe("Patient name."),
    patient_phone: z.string().trim().min(1).describe("Patient mobile number."),
    appointment_date: z.string().describe("Date in YYYY-MM-DD format."),
    appointment_time: z.string().describe("Time in HH:MM (24h) format."),
    doctor_id: z.string().optional().describe("Doctor profile id."),
    duration_minutes: z.number().int().optional().describe("Duration in minutes (default 30)."),
    notes: z.string().optional().describe("Operational notes for the visit."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        patient_name: input.patient_name,
        patient_phone: input.patient_phone,
        appointment_date: input.appointment_date,
        appointment_time: input.appointment_time,
        doctor_id: input.doctor_id ?? null,
        duration_minutes: input.duration_minutes ?? 30,
        notes: input.notes ?? null,
      })
      .select();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data?.[0]) }],
      structuredContent: { appointment: data?.[0] ?? null },
    };
  },
});
