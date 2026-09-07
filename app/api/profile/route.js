
import { cookies } from "next/headers";
import { getUserDetails, updateUserDetails } from "@/services/profile.service";
import { verifyJWT } from "@/utils/jwt";
import { NextResponse } from "next/server";


/*
|--------------------------------------------------------------------------
| GET /api/profile
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }


    const payload = verifyJWT(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }


    // users.id is BIGINT
    const userId = Number(payload.id);

    if (!Number.isSafeInteger(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 401 }
      );
    }


    const data = await getUserDetails(userId);


    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }


    /*
    |--------------------------------------------------------------------------
    | Normalize nested Supabase relationships
    |--------------------------------------------------------------------------
    */

    const usersinfo = Array.isArray(data.usersinfo)
      ? data.usersinfo[0] || {}
      : data.usersinfo || {};


    const addresses = Array.isArray(data.addresses)
      ? data.addresses[0] || {}
      : data.addresses || {};


    return NextResponse.json(
      {
        success: true,
        ...data,
        usersinfo,
        addresses,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Profile GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}


/*
|--------------------------------------------------------------------------
| POST /api/profile
|--------------------------------------------------------------------------
*/

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }


    const payload = verifyJWT(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }


    // users.id is BIGINT
    const userId = Number(payload.id);

    if (!Number.isSafeInteger(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 401 }
      );
    }


    const body = await request.json();


    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }


    const data = await updateUserDetails(
      userId,
      body
    );


    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "There was an error while updating data",
        },
        { status: 400 }
      );
    }


    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Profile POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Internal server error",
      },
      { status: 500 }
    );
  }
}

