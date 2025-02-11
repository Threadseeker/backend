import { useThreads } from "~/utils/use-threads";
import schema from "~/openapi/v1/report/reportId.get";

defineRouteMeta({
  openAPI: schema,
});

export default defineEventHandler(async (event) => {
  const reportId = getRouterParam(event, "reportId");
  const { ReportManager } = useThreads(event);

  if (!reportId) {
    setResponseStatus(event, 400);
    return {
      status: "failed",
      message: "report id is required",
    };
  }

  const report = await ReportManager.getReport(reportId);

  if (!report || report.is_finished === false) {
    setResponseStatus(event, 404);
    return {
      status: "failed",
      message: "report not found",
    };
  }

  const posts = await ReportManager.getPosts(reportId);

  // change domain of image in user profile pic
  const transformProfilePicUrl = (url: string) => {
    const cdnUrl = new URL(url);
    const reqHost = getHeader(event, "host");
    const HOSTNAME =
      reqHost === "localhost:3000"
        ? "http://localhost:3000"
        : "https://threadseeker.app";
    return `${HOSTNAME}/proxy/image${cdnUrl.pathname}${cdnUrl.search}`;
  };

  report.threads_users.profile_pic_url = transformProfilePicUrl(
    report.threads_users.profile_pic_url
  );

  // return simplified report
  return {
    status: "ok",
    report: {
      id: report.id,
      updated_at: report.updated_at,
      crawled_num: report.crawled_post_count ?? 25,
      be_liked_count: report.like_count,
      active_level: determineActiveLevel(report.post_density),
      reply_density: report.reply_density,
      post_density: report.post_density,
      created_at: report.created_at,
      is_finished: report.is_finished,
      be_replied_count: report.reply_count,
      user: {
        follower_count: report.threads_users.follower_count,
        username: report.threads_users.username,
        full_name: report.threads_users.full_name,
        profile_pic_url: report.threads_users.profile_pic_url,
      },
      posts: posts,
    },
  };
});

function determineActiveLevel(postDensity: number): string {
  if (Number.isNaN(postDensity)) return "C";
  if (postDensity < 0.5) return "C";
  if (postDensity < 1) return "B";
  if (postDensity < 1.2) return "B+";
  if (postDensity < 1.9) return "A";
  if (postDensity < 4.9) return "A+";
  if (postDensity < 8) return "A++";
  if (postDensity < 11) return "S";
  if (postDensity < 16.5) return "SSS";
  return "SSS";
}
