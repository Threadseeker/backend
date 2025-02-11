import { useRedis } from "~/utils/use-redis";

defineRouteMeta({
  openAPI: {
    tags: ["Internal"],
    description: "Check Redis service",
    responses: {
      200: {
        description: "Redis ok",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", nullable: true },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  try {
    const auth = getHeader(event, "Authorization");

    if (auth !== "vXEc5dRul61bdeuqc2DpHp1s1BBd6E") {
      setResponseStatus(event, 401);
      return {
        status: "failed",
        error: "Unauthorized",
      };
    }

    const kv = useRedis(event);
    const testId = await kv.get("userid");

    if (!testId) {
      await kv.set("userid", "1", {
        ttl: 60,
      });
    }
    return {
      id: testId,
    };
  } catch (error_) {
    return {
      status: "failed",
      error: error_,
    };
  }
});
