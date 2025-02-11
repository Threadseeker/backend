import type { H3Event } from "h3";
import { nanoid } from "nanoid";
import { useRedis } from "~/utils/use-redis";

interface Task {
  display_id: string;
  user_pkid: string;
  created_by: string;
  created_at: string;
  report_id?: string;
  is_failed: boolean;
}

export function useTasks(event: H3Event) {
  const redis = useRedis(event);
  const config = useRuntimeConfig(event);

  const add = async (issuerId: string, userPkId: string) => {
    const task: Task = {
      display_id: nanoid(10),
      user_pkid: userPkId,
      report_id: null,
      created_by: issuerId,
      created_at: new Date().toISOString(),
      is_failed: false,
    };

    try {
      await redis.set(`scheduled_task:${task.display_id}`, task, {
        ttl: 24 * 60 * 60,
      });
      await setProcessing({
        taskId: task.display_id,
        isProcessing: true,
      });
    } catch (error_) {
      console.error("Failed to set task in Redis:", error_);
      throw new Error("Failed to set task in Redis");
    }

    try {
      await $fetch(
        `${config.gcf.queueWorkerUrl}/?task=${encodeURIComponent(task.display_id)}`,
        {
          headers: {
            Authorization: config.CLOUD_FUNCTION_SECRET,
          },
        }
      );
    } catch (error_) {
      console.log("fetch error");
      throw error_;
    }

    return {
      taskId: task.display_id,
    };
  };

  const checkStatus = async (taskId: string): Promise<boolean | null> => {
    const isProcessing = await redis.get<boolean>(
      `scheduled_task:${taskId}:processing`
    );
    return isProcessing;
  };

  const setProcessing = async ({
    taskId,
    isProcessing,
  }: {
    taskId: string;
    isProcessing: boolean;
  }): Promise<void> => {
    await redis.set(`scheduled_task:${taskId}:processing`, isProcessing);
  };

  const setTask = async ({
    task,
    reportId,
    isFailed,
  }: {
    task: Task;
    reportId?: string;
    isFailed?: boolean;
  }): Promise<void> => {
    await redis.set(`scheduled_task:${task.display_id}`, {
      ...task,
      report_id: reportId,
      is_failed: isFailed ?? false,
    });
  };

  const getTask = async (taskId: string): Promise<Task | null> => {
    const task = await redis.get<Task>(`scheduled_task:${taskId}`);
    return task;
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    await redis.del(`scheduled_task:${taskId}`);
  };

  const deleteProcessing = async (taskId: string): Promise<void> => {
    await redis.del(`scheduled_task:${taskId}:processing`);
  };

  return {
    add,
    checkStatus,
    getTask,
    setTask,
    setProcessing,
    deleteTask,
    deleteProcessing,
  };
}
