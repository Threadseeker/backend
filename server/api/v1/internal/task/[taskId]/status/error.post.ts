import { useTasks } from "~/utils/use-task";

export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, "taskId");

  if (!taskId) {
    setResponseStatus(event, 400);
    return {
      status: "failed",
      message: "invalid request",
    };
  }

  const TaskManager = useTasks(event);
  const task = await TaskManager.getTask(taskId);

  if (!task) {
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
      isFailed: true,
    }),
  ]);

  return {
    status: "ok",
  };
});
