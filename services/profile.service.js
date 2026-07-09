import supabase from "@/db/supabase";
import { FaSketch } from "react-icons/fa6";

export const getUserDetails = async (id) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        `id,username,email,usersinfo(name,number,dob,gender),addresses(line1,line2,city,state,pincode)`,
      )
      .eq("id", id)
      .single();

    if (data) {
      return data;
    } else {
      console.error(error);
      return false;
    }
  } catch (error) {
    console.error(error);
  }
};

export const updateUserDetails = async (
  id,
  { name, number, dob, gender, line1, line2, city, pincode, state },
) => {
  const { data, error } = await supabase
    .from("usersinfo")
    .upsert({ id: id, name, number, dob, gender })
    .select();

  const { data2, error2 } = await supabase.from("addresses").upsert({
    id: id,
    line1,
    line2,
    city,
    state,
    pincode,
  });

  if (data) {
    return true;
  } else {
    return false;
  }
};
