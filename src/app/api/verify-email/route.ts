import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Find user by verification token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Hash the password
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user: mark as claimed, verified, and set password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isClaimed: true,
        isEmailVerified: true,
        passwordHash,
        emailVerificationToken: null, // Clear the token
      },
    });

    return NextResponse.json({
      message: "Email verified and profile claimed successfully",
      username: user.username,
    });

  } catch (error) {
    console.error("Error in verify-email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}