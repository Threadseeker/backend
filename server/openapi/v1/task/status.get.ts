import { OperationObject } from "openapi-typescript";

export default {
  tags: ["Task"],
  summary: "Get task status",
  description: "Get task status",
  parameters: [
    {
      name: "taskId",
      in: "path",
      schema: {
        type: "string",
      },
      description: "ID of th crawling task",
      required: true,
    },
  ],
  responses: {
    200: {
      description: "Task status",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["ok", "failed"] },
              is_finished: { type: "boolean" },
              has_error: { type: "boolean" },
              url: { type: "string", nullable: true },
              message: { type: "string", nullable: true },
            },
          },
        },
      },
    },
    400: {
      description: "No task id provided",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["failed"] },
              message: { type: "string", enum: ["task id is required"] },
            },
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
              status: { type: "string", enum: ["failed"] },
              message: { type: "string", enum: ["Unauthorized"] },
            },
          },
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["failed"] },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },
} as OperationObject;
