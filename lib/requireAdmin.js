
import { cookies } from "next/headers";
import { verifyJWT } from "@/utils/jwt";
import supabase from "@/db/supabase";

export async function requireAdmin() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        authorized: false,
        error: "Authentication required",
        status: 401,
      };
    }

    const payload = verifyJWT(token);

    if (!payload || !payload.id) {
      return {
        authorized: false,
        error: "Invalid or expired authentication token",
        status: 401,
      };
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, role")
      .eq("id", payload.id)
      .maybeSingle();

    if (error) {
      console.error("Admin authentication error:", error);

      return {
        authorized: false,
        error: "Authentication failed",
        status: 500,
      };
    }

    if (!user) {
      return {
        authorized: false,
        error: "User not found",
        status: 401,
      };
    }

    if (user.role !== "admin") {
      return {
        authorized: false,
        error: "Admin access required",
        status: 403,
      };
    }

    return {
      authorized: true,
      user,
    };
  } catch (error) {
    console.error("requireAdmin error:", error);

    return {
      authorized: false,
      error: "Authentication failed",
      status: 401,
    };
  }
}

