import { db } from "./db";
import { getSession } from "./auth";

export const serverApi = {
  minor: {
    dashboard: async () => db.getDashboardStats(),
    sprints: {
      list: async () => db.getSprints(),
      get: async (id: number) => db.getSprintFull(id),
      nextNumber: async () => db.getNextSprintNumber(),
      calculateDates: async (startDate: string, durationDays: number = 14) =>
        db.calculateSprintDates(startDate, durationDays),
    },
    stories: {
      list: async () => db.getStories(),
    },
    peerHelp: {
      list: async () => db.getPeerHelp(),
    },
    vacations: {
      list: async () => db.getVacations(),
    },
    storyTypes: {
      list: async () => db.getStoryTypes(),
    },
  },
};

export async function getCurrentUser() {
  const session = await getSession();
  if (session.isAuthenticated) {
    return { username: session.username || "Steven" };
  }
  return null;
}
