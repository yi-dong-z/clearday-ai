export const planSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "topPriorities", "timeline", "tips"],
  properties: {
    title: {
      type: "string",
      minLength: 4,
      maxLength: 90
    },
    summary: {
      type: "string",
      minLength: 12,
      maxLength: 240
    },
    topPriorities: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "string",
        minLength: 4,
        maxLength: 90
      }
    },
    timeline: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["time", "task", "reason", "durationMinutes"],
        properties: {
          time: {
            type: "string",
            minLength: 2,
            maxLength: 40
          },
          task: {
            type: "string",
            minLength: 4,
            maxLength: 120
          },
          reason: {
            type: "string",
            minLength: 8,
            maxLength: 180
          },
          durationMinutes: {
            type: "number",
            minimum: 10,
            maximum: 240
          }
        }
      }
    },
    tips: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "string",
        minLength: 6,
        maxLength: 140
      }
    }
  }
} as const;
