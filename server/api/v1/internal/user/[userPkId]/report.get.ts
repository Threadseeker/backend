import { serverSupabaseServiceRole } from "~/utils/supabase";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const userPkID = getRouterParam(event, "userPkId");

  if (!userPkID) {
    setResponseStatus(event, 400);
    return {
      status: "failed",
      message: "Report id is required",
    };
  }
  const { data: report, error } = await supabase
    .from("reports")
    .select("id, updated_at, is_finished")
    .eq("user_pkid", userPkID)
    .maybeSingle();

  if (error) {
    console.error(error);
    setResponseStatus(event, 500);
    return {
      status: "failed",
      message: "Internal server error",
    };
  }

  if (!report) {
    return {
      status: "ok",
      report_id: null,
      updated_at: null,
      is_finished: null,
    };
  }

  return {
    status: "ok",
    report_id: report.id,
    updated_at: report.updated_at,
    is_finished: report.is_finished,
  };
});
