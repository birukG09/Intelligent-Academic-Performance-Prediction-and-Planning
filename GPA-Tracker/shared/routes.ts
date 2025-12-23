import { z } from 'zod';
import { insertCourseSchema, courses, predictions } from './schema';

export const api = {
  courses: {
    list: {
      method: 'GET' as const,
      path: '/api/courses',
      responses: {
        200: z.array(z.custom<typeof courses.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/courses',
      input: insertCourseSchema,
      responses: {
        201: z.custom<typeof courses.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/courses/:id',
      responses: {
        204: z.void(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  predictions: {
    get: {
      method: 'GET' as const,
      path: '/api/predictions',
      responses: {
        200: z.custom<typeof predictions.$inferSelect>(),
      },
    },
    calculate: {
      method: 'POST' as const,
      path: '/api/predictions/calculate',
      responses: {
        200: z.custom<typeof predictions.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
