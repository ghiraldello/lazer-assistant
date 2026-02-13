import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Get the authenticated user's ID from the session.
 * Returns the userId string, or a NextResponse 401 error.
 */
export async function getAuthUserId(): Promise<
  string | NextResponse
> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  return session.user.id;
}
