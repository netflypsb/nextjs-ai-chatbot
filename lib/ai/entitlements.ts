import type { UserType } from "@/lib/auth";

type Entitlements = {
  maxMessagesPerDay: number;
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
