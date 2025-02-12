import { serverSupabaseUser } from "~/utils/supabase";
import config from "~~/threadseeker.config";

export default defineEventHandler(async (event) => {
  const isPublicRoute = config.publicRoutes.some((route) =>
    getRequestURL(event).pathname.startsWith(route)
  );

  if (!isPublicRoute) {
    try {
      const user = await serverSupabaseUser(event);

      event.context.reqUser = user;
    } catch {
      // Not logged in
      event.context.reqUser = null;
    }
  }
});
