// This middleware would response first and stop the request if the request is not internal

export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname.startsWith("/api/v1/internal")) {
    const { INTERNAL_SECRET } = useRuntimeConfig(event);
    const reqInternalToken = getHeader(event, "X-Internal-Token");

    if (reqInternalToken !== INTERNAL_SECRET) {
      setResponseStatus(event, 401);
      return {
        status: "failed",
        message: "unauthorized",
      };
    }
  }
});
