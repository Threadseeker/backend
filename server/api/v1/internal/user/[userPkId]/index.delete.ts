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
  await supabase.from("reports").delete().eq("user_pkid", userPkID);
  await supabase.from("threads_users").delete().eq("pk_id", userPkID);

  return {
    status: "ok",
  };
});
