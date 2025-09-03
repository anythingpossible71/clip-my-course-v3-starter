import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth/auth";
import { sendEmail, getVerificationEmailTemplate } from "@/lib/email/email";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  redirectUrl: z.string().optional(),
  ageVerification: z.boolean().refine(val => val === true, {
    message: "You must be at least 16 years old to use this service"
  }),
  termsAgreement: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms of Use"
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = signUpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, password, redirectUrl, ageVerification, termsAgreement } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with default user role
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // Create user profile
      await tx.userProfile.create({
        data: {
          user_id: newUser.id,
        },
      });

      // Assign default user role
      const userRole = await tx.role.findUnique({
        where: { name: "user" },
      });

      if (userRole) {
        await tx.userRole.create({
          data: {
            user_id: newUser.id,
            role_id: userRole.id,
          },
        });
      }

      return newUser;
    });

    // Generate verification token
    const verificationToken = generateToken(user.id, "verification");

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const emailTemplate = getVerificationEmailTemplate(verificationToken, appUrl, redirectUrl);
    await sendEmail({
      ...emailTemplate,
      to: user.email,
    });

    // Store redirect URL in session or pass it through the verification flow
    // For now, we'll redirect to signin with the redirect URL
    const redirectTo = redirectUrl 
      ? `/auth/signin?message=Check your email to verify your account&redirect=${encodeURIComponent(redirectUrl)}`
      : "/auth/signin?message=Check your email to verify your account";

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
