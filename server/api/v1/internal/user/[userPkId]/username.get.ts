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

  const { data: threadsUser } = await supabase
    .from("threads_users")
    .select("username")
    .eq("pk_id", userPkID)
    .maybeSingle();

  return {
    status: "ok",
    username: threadsUser?.username || null,
    pk_id: userPkID,
  };
});
