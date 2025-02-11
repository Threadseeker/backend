import { OperationObject } from "openapi-typescript";

export default {
  summary: "Health Check",
  description: "Check the health of the server",
  tags: ["Internal"],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              timestamp: {
                type: "string",
                format: "date-time",
              },
              status: {
                type: "string",
                enum: ["ok"],
              },
              dependencies: {
                type: "object",
                properties: {
                  redis: {
                    type: "string",
                    enum: ["ok"],
                  },
                  threadsApi: {
                    type: "string",
                    enum: ["ok"],
                  },
                },
                required: ["redis", "threadsApi"],
              },
            },
            required: ["timestamp", "status", "dependencies"],
          },
        },
      },
    },
    500: {
      description: "Not ok",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["failed"],
              },
              timestamp: {
                type: "string",
                format: "date-time",
              },
              dependencies: {
                type: "object",
                properties: {
                  redis: {
                    type: "string",
                    enum: ["failed"],
                  },
                  threadsApi: {
                    type: "string",
                    enum: ["failed"],
                  },
                },
                required: ["redis", "threadsApi"],
              },
            },
          },
        },
      },
    },
  },
} as OperationObject;
