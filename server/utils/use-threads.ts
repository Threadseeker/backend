import type { H3Event } from "h3";
import { useRedis } from "~/utils/use-redis";
import { serverSupabaseServiceRole } from "~/utils/supabase";

interface ThreadsUser {
  text_post_app_is_private: boolean;
  username: string;
  id: string;
  pk: string;
  profile_pic_url: string | null;
}

interface ThreadsUserFunctionResponse {
  data: ThreadsUser | null;
  status: "ok" | "not_found" | "failed";
}

type UpsertUser = Omit<ThreadsUser, "text_post_app_is_private" | "pk">;

export function useThreads(event: H3Event) {
  const supabase = serverSupabaseServiceRole(event);
  const kv = useRedis(event);

  const ReportManager = {
    getReport: async (reportId: string) => {
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .select(
          `*,
        threads_users (
          pk_id,
          username,
          full_name,
          follower_count,
          following_count,
          profile_pic_url
        )
      `
        )
        .eq("id", reportId)
        .maybeSingle();

      if (reportError) {
        console.error(reportError);
        throw new Error("internal error");
      }

      return report;
    },

    getPosts: async (reportId: string) => {
      const { data: posts, error: postsError } = await supabase
        .from("popular_posts")
        .select(
          `
        id,
        caption,
        permalink,
        reply_count,
        like_count
        `
        )
        .eq("report_id", reportId);

      if (postsError) {
        console.error(postsError);
        throw new Error("Internal Server Error");
      }

      return posts;
    },

    upsertReport: async (newReport: {
      id: string;
      user_pkid: string;
      like_count: number;
      reply_count: number;
      crawled_post_count: number;
      average_post_time: number;
      post_density: number;
      reply_density: number;
      is_finished: boolean;
    }) => {
      const { error: updateResultError } = await supabase
        .from("reports")
        .upsert(
          {
            ...newReport,
            is_finished: true,
          },
          {
            onConflict: "id",
          }
        );
      if (updateResultError) {
        console.error(`updateResultError: ${updateResultError}`);
        throw new Error("Internal Server Error");
      }
    },
  };

  const PostManager = {
    getPosts: async (reportId: string) => {
      const { data: posts, error: postsError } = await supabase
        .from("popular_posts")
        .select(
          `
        id,
        caption,
        permalink,
        reply_count,
        like_count
        `
        )
        .eq("report_id", reportId);

      if (postsError) {
        console.error(postsError);
        throw new Error("Internal Server Error");
      }

      return posts;
    },

    upsertPopularPosts: async (
      posts: {
        report_id: string;
        pk: string;
        permalink: string;
        caption: string;
        like_count: number;
        repost_count: number;
        quote_count: number;
        reply_count: number;
      }[]
    ) => {
      // insert new posts
      const { error: insertPostError } = await supabase
        .from("popular_posts")
        .upsert(posts, {
          onConflict: "pk",
        });
      if (insertPostError) {
        console.error(insertPostError);
        throw new Error("Internal Server Error");
      }
    },

    hideAllPosts: async (reportId: string) => {
      const { error: updatePostError } = await supabase
        .from("popular_posts")
        .update({
          is_visible: false,
        })
        .eq("report_id", reportId);

      if (updatePostError) {
        console.error(`updatePostError: ${updatePostError}`);
        throw new Error("Internal Server Error");
      }
    },
  };

  const UserManager = {
    upsertUser: async (newUser: UpsertUser) => {
      return await supabase.from("threads_users").upsert(
        {
          username: newUser.username,
          pk_id: newUser.id,
          profile_pic_url: newUser.profile_pic_url ?? null,
        },
        {
          onConflict: "pk_id",
        }
      );
    },
    getUserProfile: async (username: string): Promise<null | ThreadsUser> => {
      const config = useRuntimeConfig(event);
      const response = await $fetch<ThreadsUserFunctionResponse>(config.gcf.usernameWorkerUrl,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${config.CLOUD_FUNCTION_SECRET}`
          },
          params: {
            username,
          },
        }
      )
      if(response.data && response.status === "ok") {
        return response.data;
      }
      return null;
    },
    getUserReport: async (userPkId: string) => {
      const { data } = await supabase
        .from("reports")
        .select("id, updated_at")
        .eq("user_pkid", userPkId)
        .eq("is_finished", true)
        .maybeSingle();

      return data
        ? {
            id: data?.id,
            updateAt: data?.updated_at,
          }
        : null;
    },
    getPrimaryKey: async (username: string): Promise<string | null> => {
      const { data, error } = await supabase
        .from("threads_users")
        .select("pk_id")
        .eq("username", username)
        .maybeSingle();
      if (error) {
        console.error(error);
        throw new Error("Internal Server Error");
      }
      return data?.pk_id ?? null;
    },
    checkUpdated: async (username: string) => {
      return await kv.get<boolean>(`profile_updated:${username}`);
    },

    setUpdated: async (
      username: string,
      {
        isUpdated,
        ttl = 60 * 60 * 24,
      }: {
        isUpdated: boolean;
        ttl?: number;
      }
    ) => {
      await kv.set(`profile_updated:${username}`, isUpdated, {
        ttl,
      });
    },
  };

  return {
    UserManager,
    ReportManager,
    PostManager,
  };
}
