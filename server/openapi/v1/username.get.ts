import { OperationObject } from "openapi-typescript";

export default {
  tags: ["Threads"],
  summary: "Get user info",
  description: "Get user info",
  operationId: "getThreadsUser",
  parameters: [
    {
      name: "username",
      in: "path",
      schema: {
        type: "string",
      },
      description: "Username",
      required: true,
    },
  ],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: {
            type: "object",
            oneOf: [
              {
                type: "object",
                description: "User is found and a task is created",
                properties: {
                  status: { type: "string", enum: ["ok"] },
                  is_finished: { type: "boolean" },
                  task_id: { type: "string" },
                },
                required: ["status", "is_finished", "task_id"],
              },
              {
                type: "object",
                description: "User is found and has a valid report",
                properties: {
                  status: { type: "string", enum: ["ok"] },
                  is_finished: { type: "boolean" },
                  report_id: { type: "string" },
                },
                required: ["status", "is_finished", "report_id"],
              },
              {
                type: "object",
                description: "User is found but is private",
                properties: {
                  status: { type: "string", enum: ["failed"] },
                  is_private: { type: "boolean" },
                },
                required: ["status", "is_private"],
              },
              {
                type: "object",
                description: "User is not found or other errors",
                properties: {
                  status: { type: "string", enum: ["failed"] },
                  message: { type: "string" },
                },
                required: ["status", "message"],
              },
            ],
          },
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string", enum: ["Unauthorized"] },
            },
          },
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["failed"] },
              message: { type: "string", enum: ["username is required"] },
            },
          },
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["failed"] },
              message: { type: "string", enum: ["try again later"] },
            },
          },
        },
      },
    },
  },
} as OperationObject;
