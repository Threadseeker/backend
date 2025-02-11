import { OperationObject } from "openapi-typescript";

export default {
  tags: ["Threads"],
  summary: "Get activity level report",
  description: "Get activity level report",
  parameters: [
    {
      name: "reportId",
      in: "path",
      schema: {
        type: "string",
      },
      required: true,
      description: "ID of the activity level report",
    },
  ],
  responses: {
    400: {
      description: "No report id provided",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["failed"] },
              message: { type: "string", enum: ["Report id is required"] },
            },
          },
        },
      },
    },
    404: {
      description: "Report not found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["failed"] },
              message: { type: "string", enum: ["Report not found"] },
            },
          },
        },
      },
    },
    200: {
      description: "Report found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "string" },
              status: {
                type: "string",
                enum: ["ok", "failed"],
              },
              report: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  updated_at: { type: "string" },
                  crawled_num: { type: "number" },
                  be_liked_count: { type: "number" },
                  active_level: { type: "string" },
                  reply_density: { type: "number" },
                  post_density: { type: "number" },
                  created_at: { type: "string" },
                  is_finished: { type: "boolean" },
                  be_replied_count: { type: "number" },
                  user: {
                    type: "object",
                    properties: {
                      username: { type: "string" },
                      full_name: { type: "string" },
                      profile_pic_url: { type: "string" },
                      follower_count: { type: "number" },
                    },
                  },
                  posts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        caption: { type: "string" },
                        permalink: { type: "string" },
                        reply_count: { type: "number" },
                        like_count: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as OperationObject;
