import { getUserDetails, updateUserDetails } from "@/services/profile.service";
import { verifyJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";

export async function GET(request) {
  const cookieObj = await request.cookies.get("auth_token");

  if (!cookieObj) {
    return NextResponse.json({ error: "Unauthorized", status: 401 });
  }

  const user = verifyJWT(cookieObj.value);

  const data = await getUserDetails(user.id);

  console.log(data);

  if (data) {
    return NextResponse.json({
      ...data,
      status: 200,
    });
  }

  return NextResponse.json({ error: "Unauthorized", status: 401 });
}

export async function POST(request) {
  const cookieObj = await request.cookies.get("auth_token");

  if (!cookieObj) {
    return NextResponse.json({ error: "Unauthorized", status: 401 });
  }

  const user = verifyJWT(cookieObj.value);

  console.log(user.id);

  const body = await request.json();

  const data = await updateUserDetails(user.id, body);

  if (data) {
    return NextResponse.json({
      success: true,
      status: 200,
    });
  } else {
    return NextResponse.json({
      error: "There was some error while updating data",
      status: 400,
    });
  }
}
