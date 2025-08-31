import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, generateToken } from "@/lib/auth/auth";
import { sendEmail, getMagicLinkEmailTemplate } from "@/lib/email/email";
import { z } from "zod";

const signInSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("password"),
    email: z.string().email(),
    password: z.string(),
    redirectUrl: z.string().optional(),
  }),
  z.object({
    type: z.literal("magiclink"),
    email: z.string().email(),
    redirectUrl: z.string().optional(),
  }),
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = signInSchema.safeParse(body);

    if (!validationResult.success) {
      console.log("❌ Sign in validation failed:", validationResult.error.errors);
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    console.log("🔐 Sign in attempt for email:", data.email, "type:", data.type);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
        deleted_at: null,
      },
    });

    if (!user) {
      console.log("❌ User not found for email:", data.email);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    console.log("✅ User found:", user.email, "ID:", user.id);

    if (data.type === "password") {
      // Verify password
      if (!user.password) {
        console.log("❌ No password set for user:", user.email);
        return NextResponse.json(
          { error: "Password sign-in not available for this account" },
          { status: 401 }
        );
      }

      const isValidPassword = await verifyPassword(data.password, user.password);

      if (!isValidPassword) {
        console.log("❌ Invalid password for user:", user.email);
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      console.log("✅ Password verified for user:", user.email);

      // Update last signed in
      await prisma.user.update({
        where: { id: user.id },
        data: { last_signed_in: new Date() },
      });

      // Create session
      await createSession(user.id);

      console.log("✅ Session created successfully for user:", user.email);
      console.log("🔄 User will be redirected to /courses");

      return NextResponse.json({
        success: true,
        message: "Signed in successfully",
      });
    } else {
      // Magic link flow
      console.log("🔗 Generating magic link for user:", user.email);
      
      const token = generateToken(user.id, "magic_link");

      // Send magic link email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
      const magicLinkUrl = data.redirectUrl 
        ? `${appUrl}/api/auth/magic-link?token=${token}&redirect=${encodeURIComponent(data.redirectUrl)}`
        : `${appUrl}/api/auth/magic-link?token=${token}`;
      
      const emailTemplate = getMagicLinkEmailTemplate(magicLinkUrl);
      await sendEmail({
        ...emailTemplate,
        to: user.email,
      });

      console.log("✅ Magic link sent to:", user.email);

      return NextResponse.json({
        success: true,
        message: "Magic link sent to your email",
      });
    }
  } catch (error) {
    console.error("❌ Sign in error:", error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}
