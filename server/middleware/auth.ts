import { serverSupabaseUser } from "~/utils/supabase";

export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname.startsWith("/api")) {
    try {
      const user = await serverSupabaseUser(event);

      event.context.reqUser = user;
    } catch {
      // Not logged in
      event.context.reqUser = null;
    }
  }
});
