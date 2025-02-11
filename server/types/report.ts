export interface ThreadsReport {
  id: string;
  user_pkid: string;
  is_finished: boolean;
  created_at: string;
  updated_at: string;
  active_level?: null | string;
  threads_users: {
    pk_id: string;
    username: string;
    full_name: string;
    follower_count: number;
    following_count: number;
    profile_pic_url: string;
  };
}
