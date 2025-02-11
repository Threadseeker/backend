import { H3Event } from "h3";
import { useThreads } from "~/utils/use-threads";
import { useSearchCount } from "~/utils/use-search-count";
import schema from "~/openapi/v1/username.get";

defineRouteMeta({
  openAPI: schema,
});

const SEARCH_QUOTA_PER_DAY = 3;
const REPORT_VALID_DAYS = 2;

export default defineEventHandler(async (event) => {
  try {
    // seconds left in the day
    const secondsLeft = getLeftSecondsInDay();
    const superEmail = "wwwsean13579@gmail.com";
    const username = getRouterParam(event, "username");
    const reqUser = event.context.reqUser;

    const { getSearchCount, setSearchCount } = useSearchCount(event);
    const { UserManager } = useThreads(event);
    const TaskManager = useTasks(event);

    if (!reqUser) {
      setResponseStatus(event, 401);
      return { message: "Unauthorized" };
    }

    if (!username) {
      setResponseStatus(event, 400);
      return {
        status: "failed",
        message: "username is required",
      };
    }

    let todayCount = await getSearchCount(reqUser.id);

    if (todayCount === null) {
      todayCount = 0;
      await setSearchCount({
        userId: reqUser.id,
        count: todayCount,
        ttl: secondsLeft,
      });
    }

    const threadsUserPk = await UserManager.getPrimaryKey(username);

    // The user was stored in supabase before
    if (threadsUserPk) {
      const isUpdated = await UserManager.checkUpdated(username);

      // If the user has not been updated in the last 12 hours, update it ( call threads api )
      if (!isUpdated) {
        const newInfo = await UserManager.getUserProfile(username);

        // 如果有成功抓到新資料，則更新到 supabase
        if (newInfo) {
          if (newInfo.text_post_app_is_private) {
            return {
              status: "failed",
              is_private: true,
            };
          }

          const { error: upsertError } = await UserManager.upsertUser(newInfo);

          // Stop execution if upsertError
          if (upsertError) {
            console.error(upsertError);
            return setErrorResponse(event, "try again later");
          }

          await UserManager.setUpdated(username, {
            isUpdated: true,
            ttl: 24 * 60 * 60,
          });
        } else {
          // udpated failed, shorten cache period
          await UserManager.setUpdated(username, {
            isUpdated: false,
            ttl: 10 * 60,
          });
        }
      }

      // check if there is a finished report
      const userReport = await UserManager.getUserReport(threadsUserPk);

      if (userReport) {
        try {
          const validDate = getReportValidDate(REPORT_VALID_DAYS);
          const reportDate = new Date(userReport.updateAt);
          const reportOutdated =
            !Number.isNaN(reportDate) && reportDate < validDate;

          // check if the report is outdated ( updated before valid days )
          if (reportOutdated) {
            const { taskId } = await TaskManager.add(reqUser.id, threadsUserPk);
            return {
              status: "ok",
              is_finished: false,
              task_id: taskId,
            };
          }

          // if user report is updated within valid days, return the report id
          return {
            status: "ok",
            is_finished: true,
            report_id: userReport.id,
          };
        } catch (error) {
          console.error(error);
          return setErrorResponse(event, "try again later");
        }
      }
    }

    if (todayCount >= SEARCH_QUOTA_PER_DAY && reqUser.email !== superEmail) {
      return {
        status: "failed",
        message: "too many requests",
      };
    }

    // A new user is added
    // crawl user and save to supabase
    // then create a task for this user

    const threadUserProfile = await UserManager.getUserProfile(username);

    if (!threadUserProfile) {
      return {
        status: "failed",
        message: "user not found",
      };
    }

    if (threadUserProfile.text_post_app_is_private) {
      return {
        status: "failed",
        is_private: true,
      };
    }

    const { error: upsertError } =
      await UserManager.upsertUser(threadUserProfile);

    if (upsertError) {
      console.error(upsertError);
      return setErrorResponse(event, "try again later");
    }

    const [{ taskId: newTaskId }] = await Promise.all([
      TaskManager.add(reqUser.id, threadUserProfile.id),
      setSearchCount({
        userId: reqUser.id,
        count: Number(todayCount) + 1,
        ttl: secondsLeft,
      }),
    ]);

    return {
      status: "ok",
      is_finished: false,
      task_id: newTaskId,
    };
  } catch (error) {
    console.error(error);
    return setErrorResponse(event, "try again later");
  }
});

// Usage: return setErrorResponse(event, 'try again later');
function setErrorResponse(event: H3Event, message: string) {
  setResponseStatus(event, 500);
  return {
    status: "failed",
    message: message,
  };
}

function getLeftSecondsInDay() {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const leftSeconds = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
  return leftSeconds;
}

function getReportValidDate(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}
