"use client";

import { useClerk } from "@clerk/nextjs";

export const SignOutForm = () => {
  const { signOut } = useClerk();

  return (
    <button
      className="w-full px-1 py-0.5 text-left text-red-500"
      onClick={() => signOut({ redirectUrl: "/" })}
      type="button"
    >
      Sign out
    </button>
  );
};
