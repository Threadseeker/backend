import { useThreads } from "~/utils/use-threads";
import { useTasks } from "~/utils/use-task";

interface Post {
  pk: string;
  permalink: string;
  caption: string;
  like_count: number;
  repost_count: number;
  quote_count: number;
  reply_count: number;
}

interface Report {
  id: string;
  user_pkid: string;
  like_count: number;
  reply_count: number;
  crawled_post_count: number;
  average_post_time: number;
  post_density: number;
  reply_density: number;
  is_finished: true;
}

export default defineEventHandler(async (event) => {
  const {
    report,
    posts,
    task_id: taskId,
  } = (await readBody(event)) as {
    report: Report;
    posts: Post[];
    task_id: string;
  };

  if (!report || !posts || !taskId) {
    setResponseStatus(event, 400);
    return {
      status: "failed",
      message: "invalid request",
    };
  }

  const TaskManager = useTasks(event);
  const { PostManager, ReportManager } = useThreads(event);

  const useHasReport = await ReportManager.getReport(report.id);

  // if report already exists, hide posts
  if (useHasReport) {
    await PostManager.hideAllPosts(report.id);
  }

  await ReportManager.upsertReport(report);
  await PostManager.upsertPopularPosts(
    posts.map((post) => ({
      ...post,
      report_id: report.id,
    }))
  );

  const task = await TaskManager.getTask(taskId);

  if (!task) {
    console.error("task not found in create.post.ts");
    setResponseStatus(event, 404);
    return {
      status: "failed",
      message: "task not found",
    };
  }

  await Promise.all([
    TaskManager.setProcessing({
      taskId: taskId,
      isProcessing: false,
    }),
    TaskManager.setTask({
      task,
      reportId: report.id,
      isFailed: false,
    }),
  ]);

  // return ok
  return {
    status: "ok",
  };
});
