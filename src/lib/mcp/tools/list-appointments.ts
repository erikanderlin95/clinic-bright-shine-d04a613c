import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_appointments",
  title: "List appointments",
  description:
    "List clinic appointments, optionally filtered by date (YYYY-MM-DD), status, or doctor id.",
  inputSchema: {
    date: z.string().optional().describe("Appointment date in YYYY-MM-DD format."),
    status: z.string().optional().describe("Appointment status, e.g. scheduled or cancelled."),
    doctor_id: z.string().optional().describe("Doctor profile id to filter by."),
    limit: z.number().int().optional().describe("Maximum rows to return (default 50, max 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ date, status, doctor_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("appointments")
      .select(
        "id,appointment_date,appointment_time,duration_minutes,status,doctor_id,patient_name,patient_phone,notes",
      )
      .order("appointment_date")
      .order("appointment_time")
      .limit(Math.min(Math.max(limit ?? 50, 1), 200));

    if (date) query = query.eq("appointment_date", date);
    if (status) query = query.eq("status", status);
    if (doctor_id) query = query.eq("doctor_id", doctor_id);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { appointments: data ?? [] },
    };
  },
});
