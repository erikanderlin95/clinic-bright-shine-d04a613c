import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_doctors",
  title: "List doctors",
  description: "List clinician profiles in the clinic roster, optionally only active ones.",
  inputSchema: {
    active_only: z.boolean().optional().describe("Only return active doctors. Defaults to true."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ active_only }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("doctor_profiles")
      .select("id,name,title,specialization,languages,years_of_experience,is_active")
      .order("name");
    if (active_only !== false) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { doctors: data ?? [] },
    };
  },
});
