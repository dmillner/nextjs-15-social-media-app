import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { username, email } = await req.json();

    if (!username || !email) {
      return NextResponse.json(
        { error: "Username and email are required" },
        { status: 400 }
      );
    }

    // Validate .edu email
    if (!email.endsWith(".edu")) {
      return NextResponse.json(
        { error: "Email must be a valid .edu address" },
        { status: 400 }
      );
    }

    // Find the user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if already claimed
    if (user.isClaimed) {
      return NextResponse.json(
        { error: "This profile has already been claimed" },
        { status: 400 }
      );
    }

    // Check if email is already used
    const existingEmailUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmailUser && existingEmailUser.id !== user.id) {
      return NextResponse.json(
        { error: "This email is already associated with another profile" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Update user with email and verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        emailVerificationToken: verificationToken,
      },
    });

    // In a real app, you would send an email here
    // For now, we'll return the verification link for testing
    const verificationLink = `${req.nextUrl.origin}/verify-email?token=${verificationToken}`;

    return NextResponse.json({
      message: "Verification email sent successfully",
      verificationLink, // Remove this in production
    });

  } catch (error) {
    console.error("Error in claim-profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}