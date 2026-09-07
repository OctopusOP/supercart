
import supabase from "@/db/supabase";

/*
|--------------------------------------------------------------------------
| Get User Details
|--------------------------------------------------------------------------
|
| Gets:
| - Basic user information
| - usersinfo information
| - The user's default address
|
*/

export const getUserDetails = async (userId) => {
  try {
    const numericUserId = Number(userId);

    if (
      !Number.isSafeInteger(numericUserId) ||
      numericUserId <= 0
    ) {
      console.error(
        "Invalid user ID:",
        userId
      );

      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        username,
        email,

        usersinfo (
          name,
          number,
          dob,
          gender
        ),

        addresses (
          id,
          user_id,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          country,
          pincode,
          is_default,
          created_at,
          updated_at
        )
      `)
      .eq("id", numericUserId)
      .maybeSingle();

    if (error) {
      console.error(
        "Error fetching user details:",
        error
      );

      return null;
    }

    if (!data) {
      return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Pick default address
    |--------------------------------------------------------------------------
    |
    | If there is a default address, return that.
    | Otherwise return the first address.
    |
    */

    const addresses = Array.isArray(
      data.addresses
    )
      ? data.addresses
      : data.addresses
        ? [data.addresses]
        : [];

    const defaultAddress =
      addresses.find(
        (address) =>
          address?.is_default === true
      ) ||
      addresses[0] ||
      null;

    /*
    |--------------------------------------------------------------------------
    | Normalize response
    |--------------------------------------------------------------------------
    |
    | The frontend uses:
    | line1 / line2
    |
    | Database uses:
    | address_line1 / address_line2
    |
    | We convert the database structure here so
    | the frontend doesn't need to know database
    | column names.
    |
    */

    const usersinfo = Array.isArray(
      data.usersinfo
    )
      ? data.usersinfo[0] || {}
      : data.usersinfo || {};

    const normalizedAddress =
      defaultAddress
        ? {
            id: defaultAddress.id,
            user_id:
              defaultAddress.user_id,

            full_name:
              defaultAddress.full_name,

            phone:
              defaultAddress.phone,

            line1:
              defaultAddress.address_line1 ||
              "",

            line2:
              defaultAddress.address_line2 ||
              "",

            city:
              defaultAddress.city || "",

            state:
              defaultAddress.state || "",

            country:
              defaultAddress.country ||
              "India",

            pincode:
              defaultAddress.pincode || "",

            is_default:
              Boolean(
                defaultAddress.is_default
              ),

            created_at:
              defaultAddress.created_at,

            updated_at:
              defaultAddress.updated_at,
          }
        : {};

    return {
      ...data,

      usersinfo,

      /*
       * Keep the frontend-compatible structure.
       */
      addresses: normalizedAddress,
    };
  } catch (error) {
    console.error(
      "Error in getUserDetails:",
      error
    );

    return null;
  }
};


/*
|--------------------------------------------------------------------------
| Update User Details
|--------------------------------------------------------------------------
|
| Updates:
| - usersinfo
| - Existing address
|
| If the user doesn't have an address yet,
| a new address is created.
|
*/

export const updateUserDetails = async (
  userId,
  {
    name,
    number,
    dob,
    gender,

    line1,
    line2,
    city,
    pincode,
    state,

    /*
     * Optional fields. The current profile page
     * doesn't need these, but supporting them makes
     * this service more flexible.
     */
    full_name,
    phone,
    country = "India",
    default: isDefault = true,
  }
) => {
  try {
    const numericUserId = Number(userId);

    if (
      !Number.isSafeInteger(
        numericUserId
      ) ||
      numericUserId <= 0
    ) {
      console.error(
        "Invalid user ID:",
        userId
      );

      return false;
    }

    /*
    |--------------------------------------------------------------------------
    | 1. Update usersinfo
    |--------------------------------------------------------------------------
    */

    const { error: userInfoError } =
      await supabase
        .from("usersinfo")
        .upsert(
          {
            id: numericUserId,
            name:
              name?.trim() || null,
            number:
              number?.trim() || null,
            dob:
              dob || null,
            gender:
              gender || null,
          },
          {
            onConflict: "id",
          }
        );

    if (userInfoError) {
      console.error(
        "Error updating usersinfo:",
        userInfoError
      );

      return false;
    }


    /*
    |--------------------------------------------------------------------------
    | 2. Find existing address belonging to this user
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | We search by user_id.
    |
    | We DO NOT use:
    | addresses.id = users.id
    |
    */

    const {
      data: existingAddress,
      error: addressFindError,
    } = await supabase
      .from("addresses")
      .select(`
        id,
        user_id,
        is_default
      `)
      .eq(
        "user_id",
        numericUserId
      )
      .order(
        "is_default",
        {
          ascending: false,
        }
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      )
      .limit(1)
      .maybeSingle();

    if (addressFindError) {
      console.error(
        "Error finding user address:",
        addressFindError
      );

      return false;
    }


    /*
    |--------------------------------------------------------------------------
    | Address values
    |--------------------------------------------------------------------------
    */

    const addressValues = {
      user_id: numericUserId,

      full_name:
        full_name?.trim() ||
        name?.trim() ||
        null,

      phone:
        phone?.trim() ||
        number?.trim() ||
        null,

      address_line1:
        line1?.trim() || null,

      address_line2:
        line2?.trim() || null,

      city:
        city?.trim() || null,

      state:
        state?.trim() || null,

      country:
        country?.trim() ||
        "India",

      pincode:
        pincode?.trim() || null,

      is_default:
        Boolean(isDefault),

      updated_at:
        new Date().toISOString(),
    };


    /*
    |--------------------------------------------------------------------------
    | 3A. Update existing address
    |--------------------------------------------------------------------------
    */

    if (existingAddress) {
      const {
        data: updatedAddress,
        error: updateAddressError,
      } = await supabase
        .from("addresses")
        .update(addressValues)
        .eq(
          "id",
          existingAddress.id
        )
        .eq(
          "user_id",
          numericUserId
        )
        .select()
        .single();

      if (updateAddressError) {
        console.error(
          "Error updating address:",
          updateAddressError
        );

        return false;
      }

      return {
        success: true,

        usersinfo: {
          id: numericUserId,
          name:
            name?.trim() || null,
          number:
            number?.trim() || null,
          dob:
            dob || null,
          gender:
            gender || null,
        },

        addresses:
          updatedAddress,
      };
    }


    /*
    |--------------------------------------------------------------------------
    | 3B. No address exists → create one
    |--------------------------------------------------------------------------
    */

    const {
      data: newAddress,
      error: createAddressError,
    } = await supabase
      .from("addresses")
      .insert({
        ...addressValues,
        created_at:
          new Date().toISOString(),
      })
      .select()
      .single();

    if (createAddressError) {
      console.error(
        "Error creating address:",
        createAddressError
      );

      return false;
    }


    return {
      success: true,

      usersinfo: {
        id: numericUserId,
        name:
          name?.trim() || null,
        number:
          number?.trim() || null,
        dob:
          dob || null,
        gender:
          gender || null,
      },

      addresses:
        newAddress,
    };
  } catch (error) {
    console.error(
      "Error in updateUserDetails:",
      error
    );

    return false;
  }
};

