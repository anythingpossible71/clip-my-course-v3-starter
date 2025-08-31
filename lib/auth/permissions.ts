import { prisma } from "@/lib/prisma";
import { getSession, clearSession } from "./auth";
import { redirect } from "next/navigation";

export async function hasRole(userId: number, roleName: string): Promise<boolean> {
  const userRole = await prisma.userRole.findFirst({
    where: {
      user_id: userId,
      role: {
        name: roleName,
      },
      deleted_at: null,
    },
  });

  return !!userRole;
}

export async function requireRole(roleName: string) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const hasRequiredRole = await hasRole(session.userId, roleName);

  if (!hasRequiredRole) {
    redirect("/");
  }

  return session;
}

export async function isAdmin(userId: number): Promise<boolean> {
  return hasRole(userId, "admin");
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // Handle case where JWT token contains encoded ID instead of raw integer
  // This can happen if there's an old/corrupted token
  if (typeof session.userId !== 'number') {
    console.warn('⚠️ Session contains non-numeric userId, clearing session:', session.userId);
    // Clear session via API route since we can't modify cookies in Server Components
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/clear-session`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
        deleted_at: null,
      },
      include: {
        profile: true,
        roles: {
          where: {
            deleted_at: null,
          },
          include: {
            role: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('❌ Error in getCurrentUser:', error);
    // If there's a database error due to invalid userId, clear the session
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/clear-session`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (clearError) {
      console.error('Failed to clear session:', clearError);
    }
    return null;
  }
}
