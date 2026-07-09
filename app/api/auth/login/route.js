import { validateUser } from "@/services/auth.service";
import { comparePassword } from "@/utils/hash";
import { generateJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  const { userinfo, password } = body;

  if (!userinfo || !password) {
    return NextResponse.json({
      error: "Fill all the required fields",
      status: 400,
    });
  }

  const data = await validateUser(userinfo, password);
  if (data) {
    const valid = await comparePassword(data.password_hash, password);

    if (valid) {
      // 1. Create the response object
      const res = NextResponse.json({ success: true, status: 200 });

      // 2. GENERATE JWT
      const token = generateJWT(data.id);

      // 3. Set the cookie maxAge to match your JWT's 15-minute expiration
      res.cookies.set("auth_token", token);

      return res;
    }
  }

  // Fallback for failed authentication
  return NextResponse.json({
    error: "Invalid Username or Password",
    status: 401, // Best practice: 401 Unauthorized for bad credentials
  });
}
