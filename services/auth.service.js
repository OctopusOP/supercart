import supabase from "@/db/supabase.js";
import { comparePassword, encryptPassword } from "../utils/hash.js";
import { NextResponse } from "next/server.js";

export const checkEmailExists = async (email) => {
  try {
    console.log("Searching for:", email);

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error(error);
      return false;
    }

    return !!data; // true if found, false if null
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const checkUsernameExists = async (username) => {
  try {
    console.log("Searching for:", username);

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error(error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const addUser = async (username, email, password_hash) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert({ username, email, password_hash })
      .select("id")
      .single();

    if (data) {
      return true;
    }
    if (error) {
      console.error(error);
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const validateUser = async (userinfo, password) => {
  try {
    //CHECK IF ITS A EMAIL OR USERNAME
    const table = userinfo.includes("@") ? "email" : "username";

    const { data, error } = await supabase
      .from("users")
      .select("id,username,email,password_hash")
      .eq(table, userinfo)
      .single();

    if (data) {
      return data;
    }

    if (error) {
      console.error(error);
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};
