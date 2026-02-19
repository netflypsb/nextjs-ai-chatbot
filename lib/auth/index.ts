import "server-only";

import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/db/queries";

export type UserType = "regular";

export type Session = {
  user: {
    id: string;
    email: string;
    type: UserType;
  };
};

/**
 * Get the current authenticated user session.
 * Ensures the user exists in our DB (upserts on first access).
 * Returns null if not authenticated.
 */
export async function auth(): Promise<Session | null> {
  const { userId } = await clerkAuth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ?? `user-${userId}`;

  // Ensure user exists in our database
  await ensureUser(userId, email);

  return {
    user: {
      id: userId,
      email,
      type: "regular",
    },
  };
}
