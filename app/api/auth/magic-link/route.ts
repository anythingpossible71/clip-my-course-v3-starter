import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, createSession } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const redirect = searchParams.get("redirect");

    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin?error=no_token", request.url));
    }

    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.redirect(new URL("/auth/signin?error=invalid_token", request.url));
    }

    if (decoded.type !== "magic_link") {
      return NextResponse.redirect(new URL("/auth/signin?error=invalid_token_type", request.url));
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        deleted_at: null,
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin?error=user_not_found", request.url));
    }

    // Update last signed in
    await prisma.user.update({
      where: { id: user.id },
      data: { last_signed_in: new Date() },
    });

    // Create session
    await createSession(user.id);

    // Redirect to the specified URL or default to home page
    const redirectUrl = redirect ? decodeURIComponent(redirect) : "/?message=magic_link_success";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Magic link authentication error:", error);
    return NextResponse.redirect(new URL("/auth/signin?error=authentication_failed", request.url));
  }
}
