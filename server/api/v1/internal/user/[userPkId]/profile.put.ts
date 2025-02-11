import { serverSupabaseServiceRole } from "~/utils/supabase";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const userPkID = getRouterParam(event, "userPkId");
  const { profile_pic_url, full_name, follower_count } = (await readBody(
    event
  )) as {
    profile_pic_url: string;
    full_name: string;
    follower_count: number;
  };

  if (!userPkID) {
    setResponseStatus(event, 400);
    return {
      status: "failed",
      message: "Report id is required",
    };
  }

  const { error: updateProfileError } = await supabase
    .from("threads_users")
    .update({
      follower_count,
      full_name,
      profile_pic_url,
    })
    .eq("pk_id", userPkID);

  if (updateProfileError) {
    console.error("update profile error:");
    console.error(updateProfileError);

    setResponseStatus(event, 500);
    return {
      status: "failed",
      message: "failed to update profile",
    };
  }

  return {
    status: "ok",
  };
});
