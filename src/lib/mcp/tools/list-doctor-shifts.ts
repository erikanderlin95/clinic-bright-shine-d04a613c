import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_doctor_shifts",
  title: "List doctor shifts",
  description: "List the clinic's recurring doctor shifts, optionally for one day of the week.",
  inputSchema: {
    day_of_week: z.string().optional().describe("Day of week, e.g. Monday."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ day_of_week }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("doctor_shifts")
      .select("id,day_of_week,start_time,end_time,service_type,doctor_shift_assignments(doctor_id)")
      .order("start_time");
    if (day_of_week) query = query.eq("day_of_week", day_of_week);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { shifts: data ?? [] },
    };
  },
});
