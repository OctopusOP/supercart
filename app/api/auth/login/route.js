import { validateUser } from "@/services/auth.service";
import { comparePassword } from "@/utils/hash";
import { generateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const { userinfo, password } = body;

    if (!userinfo || !password) {
      return NextResponse.json(
        { error: "Fill all the required fields" },
        { status: 400 },
      );
    }

    const data = await validateUser(userinfo, password);
    if (data && data.password_hash) {
      const valid = await comparePassword(data.password_hash, password);

      if (valid) {
        // 1. Create the response object
        const res = NextResponse.json(
          { success: true, message: "Login successful" },
          { status: 200 },
        );

        // 2. GENERATE JWT (valid 7 days)
        const token = generateJWT(data.id);

        // 3. Set the auth cookie
        res.cookies.set("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return res;
      }
    }

    // Fallback for failed authentication
    return NextResponse.json(
      { error: "Invalid Username or Password" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
