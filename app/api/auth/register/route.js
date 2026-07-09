import {
  addUser,
  checkEmailExists,
  checkUsernameExists,
} from "@/services/auth.service";
import { encryptPassword } from "@/utils/hash";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;
    console.log(body);

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // 1. Check if username exists
    const us = await checkUsernameExists(username);
    if (us) {
      return NextResponse.json(
        { error: "Username Already Exists" },
        { status: 409 },
      );
    }

    // 2. Check if email exists
    const em = await checkEmailExists(email);
    if (em) {
      return NextResponse.json(
        { error: "Email Already Exists" },
        { status: 409 },
      );
    }

    // 2. Hash password
    const password_hash = await encryptPassword(password);

    // 3. Save user to database
    const user = await addUser(username, email, password_hash);
    if (user) {
      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully",
        },
        { status: 201 },
      );
    } else {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
