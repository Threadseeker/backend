import { useTasks } from "~/utils/use-task";
import schema from "~/openapi/v1/task/status.get";

defineRouteMeta({
  openAPI: schema,
});

export default defineEventHandler(async (event) => {
  try {
    const TaskManager = useTasks(event);
    const reqUser = event.context.reqUser;
    const taskId = getRouterParam(event, "taskId");

    if (!reqUser) {
      setResponseStatus(event, 401);
      return {
        status: "failed",
        message: "Unauthorized",
      };
    }

    if (!taskId) {
      setResponseStatus(event, 400);
      return {
        status: "failed",
        message: "task id is required",
      };
    }

    const task = await TaskManager.getTask(taskId);

    if (!task) {
      return {
        status: "failed",
        message: "no matched task",
      };
    }

    const isProcessing = await TaskManager.checkStatus(taskId);

    if (isProcessing === null) {
      return {
        status: "failed",
        message: "no matched task",
      };
    }

    if (task.is_failed || task.report_id) {
      await Promise.all([
        TaskManager.deleteTask(taskId),
        TaskManager.deleteProcessing(taskId),
      ]);
    }

    return {
      status: "ok",
      is_finished: isProcessing,
      has_error: task.is_failed,
      url: task.report_id ? `/report/${task.report_id}` : null,
    };
  } catch (error_) {
    console.error(error_);
    setResponseStatus(event, 500);
    return {
      status: "failed",
      message: "internal error",
    };
  }
});
