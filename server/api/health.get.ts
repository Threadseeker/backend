import { createClient } from "@redis/client";
import { ProxyAgent } from "undici";
import schema from "~/openapi/health.get";

defineRouteMeta({
  openAPI: schema,
});

interface HealthReport {
  timestamp: string;
  status: string;
  dependencies: {
    redis: string;
    threadsApi: string;
  };
}

export default defineEventHandler(async (event) => {
  const healthReport: HealthReport = {
    timestamp: new Date().toISOString(),
    status: "ok",
    dependencies: {
      redis: "ok",
      threadsApi: "ok",
    },
  };

  const { PROXY_URL } = useRuntimeConfig(event);

  try {
    const connection = createClient({
      url: process.env.REDIS_URL,
    });
    await connection.connect();
    await connection.ping();
    await connection.disconnect();
  } catch (error) {
    console.log(error);
    healthReport.dependencies.redis = "failed";
  }

  try {
    await $fetch("https://www.threads.net/graphql/query", {
      method: "GET",
      dispatcher: new ProxyAgent(PROXY_URL),
    });
  } catch (_error) {
    console.log(_error);
    healthReport.dependencies.threadsApi = "failed";
  }

  if (
    Object.values(healthReport.dependencies).every((value) => value === "ok")
  ) {
    healthReport.status = "ok";
  } else {
    setResponseStatus(event, 500);
    healthReport.status = "failed";
  }

  return healthReport;
});
