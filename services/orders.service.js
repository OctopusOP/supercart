
import supabase from "@/db/supabase";

/*
|--------------------------------------------------------------------------
| ORDER SELECT
|--------------------------------------------------------------------------
*/

const ORDER_SELECT = `
  id,
  order_number,
  user_id,
  address_id,
  status,
  payment_status,
  payment_method,
  subtotal,
  shipping_cost,
  total,
  created_at,
  updated_at,

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
    pincode
  ),

  order_items (
    id,
    order_id,
    product_variant_id,
    product_id,
    product_name,
    brand,
    color,
    size,
    sku,
    image_url,
    price,
    quantity,
    created_at
  ),

  payments (
    id,
    order_id,
    payment_method,
    payment_status,
    transaction_id,
    amount,
    paid_at,
    created_at
  )
`;


/*
|--------------------------------------------------------------------------
| Generate order number
|--------------------------------------------------------------------------
*/

function generateOrderNumber(orderId) {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `SC-${year}${month}${day}-${String(orderId).padStart(6, "0")}`;
}


/*
|--------------------------------------------------------------------------
| ADDRESS OPERATIONS
|--------------------------------------------------------------------------
*/


export async function createAddress({
  userId,
  fullName,
  phone,
  addressLine1,
  addressLine2 = null,
  city,
  state,
  country = "India",
  pincode,
  isDefault = false,
}) {
  if (!userId) {
    return {
      success: false,
      error: "User ID is required",
    };
  }

  if (
    !fullName ||
    !phone ||
    !addressLine1 ||
    !city ||
    !state ||
    !pincode
  ) {
    return {
      success: false,
      error: "All required address fields must be provided",
    };
  }

  /*
   * If this address should be default,
   * remove default from the user's existing addresses.
   */

  if (isDefault) {
    const { error: resetError } = await supabase
      .from("addresses")
      .update({
        is_default: false,
      })
      .eq("user_id", userId);

    if (resetError) {
      throw resetError;
    }
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      full_name: fullName.trim(),
      phone: phone.trim(),
      address_line1: addressLine1.trim(),
      address_line2: addressLine2
        ? addressLine2.trim()
        : null,
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      pincode: pincode.trim(),
      is_default: Boolean(isDefault),
    })
    .select(`
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
    `)
    .single();

  if (error) {
    throw error;
  }

  return {
    success: true,
    data,
  };
}


export async function getUserAddresses(userId) {
  const { data, error } = await supabase
    .from("addresses")
    .select(`
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
    `)
    .eq("user_id", userId)
    .order("is_default", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return {
    success: true,
    data: data || [],
  };
}


export async function getUserAddress(
  userId,
  addressId,
) {
  const { data, error } = await supabase
    .from("addresses")
    .select(`
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
    `)
    .eq("id", addressId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      success: false,
      error: "Address not found",
      status: 404,
    };
  }

  return {
    success: true,
    data,
  };
}


export async function updateAddress(
  userId,
  addressId,
  updates,
) {
  const allowedFields = {
    fullName: "full_name",
    phone: "phone",
    addressLine1: "address_line1",
    addressLine2: "address_line2",
    city: "city",
    state: "state",
    country: "country",
    pincode: "pincode",
  };

  const updateData = {};

  for (const [key, column] of Object.entries(
    allowedFields,
  )) {
    if (updates[key] !== undefined) {
      updateData[column] =
        typeof updates[key] === "string"
          ? updates[key].trim()
          : updates[key];
    }
  }

  if (updates.isDefault !== undefined) {
    updateData.is_default = Boolean(
      updates.isDefault,
    );
  }

  if (Object.keys(updateData).length === 0) {
    return {
      success: false,
      error: "No address fields to update",
      status: 400,
    };
  }

  /*
   * If making this address default,
   * reset other addresses first.
   */

  if (updateData.is_default === true) {
    const { error: resetError } = await supabase
      .from("addresses")
      .update({
        is_default: false,
      })
      .eq("user_id", userId)
      .neq("id", addressId);

    if (resetError) {
      throw resetError;
    }
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(updateData)
    .eq("id", addressId)
    .eq("user_id", userId)
    .select(`
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
    `)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      success: false,
      error: "Address not found",
      status: 404,
    };
  }

  return {
    success: true,
    data,
  };
}


export async function deleteAddress(
  userId,
  addressId,
) {
  const { data, error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      success: false,
      error: "Address not found",
      status: 404,
    };
  }

  return {
    success: true,
    message: "Address deleted successfully",
  };
}


/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
|
| cartSessionId comes from the cart_session cookie.
|
| IMPORTANT:
| Price, stock, colour, size and product information are
| read from Supabase. We do NOT trust values from the browser.
|
|--------------------------------------------------------------------------
*/


export async function createOrder({
  userId,
  cartSessionId,
  addressId,
  paymentMethod = "COD",
  shippingCost = 0,
}) {
  if (!userId) {
    return {
      success: false,
      error: "User ID is required",
      status: 400,
    };
  }

  if (!cartSessionId) {
    return {
      success: false,
      error: "Cart session is required",
      status: 400,
    };
  }

  if (!addressId) {
    return {
      success: false,
      error: "Address is required",
      status: 400,
    };
  }


  /*
   * Verify address belongs to this user.
   */

  const {
    data: address,
    error: addressError,
  } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", userId)
    .maybeSingle();

  if (addressError) {
    throw addressError;
  }

  if (!address) {
    return {
      success: false,
      error: "Address not found",
      status: 404,
    };
  }


  /*
   * Validate payment method.
   */

  const allowedPaymentMethods = [
    "COD",
    "UPI",
    "Card",
    "Net Banking",
  ];

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return {
      success: false,
      error: "Invalid payment method",
      status: 400,
    };
  }


  /*
   * Validate shipping.
   */

  const shipping = Number(shippingCost || 0);

  if (!Number.isFinite(shipping) || shipping < 0) {
    return {
      success: false,
      error: "Invalid shipping cost",
      status: 400,
    };
  }


  /*
   * Get current cart.
   */

  const {
    data: cartItems,
    error: cartError,
  } = await supabase
    .from("cart_items")
    .select(`
      id,
      session_id,
      product_variant_id,
      quantity,

      product_variants (
        id,
        color,
        size,
        price,
        stock,
        sku,

        products (
          id,
          name,
          brand
        ),

        variant_images (
          id,
          image_url,
          display_order
        )
      )
    `)
    .eq("session_id", cartSessionId)
    .order("created_at", {
      ascending: true,
    });

  if (cartError) {
    throw cartError;
  }

  if (!cartItems || cartItems.length === 0) {
    return {
      success: false,
      error: "Cart is empty",
      status: 400,
    };
  }


  /*
   * Validate cart and calculate total.
   */

  let subtotal = 0;

  const orderItems = [];

  for (const cartItem of cartItems) {
    const variant =
      cartItem.product_variants;

    if (!variant) {
      return {
        success: false,
        error:
          "One or more product variants are no longer available",
        status: 400,
      };
    }

    const product = variant.products;

    if (!product) {
      return {
        success: false,
        error:
          "One or more products are no longer available",
        status: 400,
      };
    }

    const quantity = Number(
      cartItem.quantity,
    );

    const price = Number(
      variant.price,
    );

    const stock = Number(
      variant.stock,
    );

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return {
        success: false,
        error: "Invalid cart quantity",
        status: 400,
      };
    }

    if (stock <= 0) {
      return {
        success: false,
        error: `${product.name} is out of stock`,
        status: 400,
      };
    }

    if (quantity > stock) {
      return {
        success: false,
        error: `Only ${stock} item(s) available for ${product.name}`,
        status: 400,
      };
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return {
        success: false,
        error: `Invalid price for ${product.name}`,
        status: 400,
      };
    }


    subtotal += price * quantity;


    /*
     * Get primary variant image.
     */

    const images = [
      ...(variant.variant_images || []),
    ].sort(
      (a, b) =>
        Number(a.display_order || 0) -
        Number(b.display_order || 0),
    );

    const imageUrl =
      images[0]?.image_url || null;


    /*
     * Store product snapshot.
     */

    orderItems.push({
      product_variant_id: variant.id,
      product_id: product.id,

      product_name: product.name,
      brand: product.brand || null,

      color: variant.color || null,
      size: variant.size || null,
      sku: variant.sku || null,

      image_url: imageUrl,

      price,
      quantity,
    });
  }


  /*
   * Calculate final total.
   */

  const total =
    Number(subtotal) + shipping;


  /*
   * Create order.
   */

  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      address_id: addressId,

      status: "pending",

      payment_status: "pending",
      payment_method: paymentMethod,

      subtotal,
      shipping_cost: shipping,
      total,
    })
    .select("id")
    .single();

  if (orderError) {
    throw orderError;
  }


  /*
   * Generate customer-friendly order number.
   */

  const orderNumber =
    generateOrderNumber(order.id);

  const {
    error: orderNumberError,
  } = await supabase
    .from("orders")
    .update({
      order_number: orderNumber,
    })
    .eq("id", order.id);

  if (orderNumberError) {
    await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    throw orderNumberError;
  }


  /*
   * Insert order items.
   */

  const orderItemRows =
    orderItems.map((item) => ({
      order_id: order.id,
      ...item,
    }));

  const {
    error: orderItemsError,
  } = await supabase
    .from("order_items")
    .insert(orderItemRows);

  if (orderItemsError) {
    await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    throw orderItemsError;
  }


  /*
   * Create payment record.
   */

  const {
    error: paymentError,
  } = await supabase
    .from("payments")
    .insert({
      order_id: order.id,
      payment_method: paymentMethod,
      payment_status: "pending",
      amount: total,
    });

  if (paymentError) {
    await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    throw paymentError;
  }


  /*
   * Reduce stock.
   *
   * IMPORTANT:
   * This should eventually be moved to a PostgreSQL
   * transaction/RPC for complete concurrency safety.
   */

  for (const cartItem of cartItems) {
    const variant =
      cartItem.product_variants;

    const quantity =
      Number(cartItem.quantity);

    const currentStock =
      Number(variant.stock);

    const newStock =
      currentStock - quantity;

    const {
      data: updatedVariant,
      error: stockError,
    } = await supabase
      .from("product_variants")
      .update({
        stock: newStock,
      })
      .eq("id", variant.id)
      .gte("stock", quantity)
      .select("id, stock")
      .maybeSingle();

    if (stockError) {
      throw stockError;
    }

    /*
     * If no row was updated, stock changed between
     * validation and update.
     */

    if (!updatedVariant) {
      return {
        success: false,
        error:
          "Stock changed while placing the order. Please try again.",
        status: 409,
      };
    }
  }


  /*
   * Clear cart.
   */

  const {
    error: clearCartError,
  } = await supabase
    .from("cart_items")
    .delete()
    .eq("session_id", cartSessionId);

  if (clearCartError) {
    throw clearCartError;
  }


  /*
   * Return complete order.
   */

  const {
    data: completeOrder,
    error: completeError,
  } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", order.id)
    .single();

  if (completeError) {
    throw completeError;
  }

  return {
    success: true,
    message: "Order created successfully",
    data: completeOrder,
    status: 201,
  };
}


/*
|--------------------------------------------------------------------------
| GET USER ORDERS
|--------------------------------------------------------------------------
*/



export async function getUserOrders({
  userId,
  page = 1,
  limit = 20,
  status,
}) {
  // Make absolutely sure the BIGINT user ID is numeric.
  const numericUserId = Number(userId);

  if (!Number.isSafeInteger(numericUserId)) {
    throw new Error("Invalid user ID");
  }

  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const from =
    (safePage - 1) * safeLimit;

  const to =
    from + safeLimit - 1;

  let query = supabase
    .from("orders")
    .select(ORDER_SELECT, {
      count: "exact",
    })
    .eq("user_id", numericUserId)
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  // Optional status filter
  if (status) {
    query = query.eq("status", status);
  }

  const {
    data,
    error,
    count,
  } = await query;

  if (error) {
    throw error;
  }

  return {
    success: true,
    data: data || [],
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count || 0,
      totalPages: Math.ceil(
        (count || 0) / safeLimit
      ),
    },
  };
}




/*
|--------------------------------------------------------------------------
| GET USER SINGLE ORDER
|--------------------------------------------------------------------------
*/


export async function getUserOrder(
  userId,
  orderId,
) {
  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      success: false,
      error: "Order not found",
      status: 404,
    };
  }

  return {
    success: true,
    data,
  };
}


/*
|--------------------------------------------------------------------------
| CANCEL USER ORDER
|--------------------------------------------------------------------------
*/


export async function cancelUserOrder(
  userId,
  orderId,
) {
  const {
    data: order,
    error: findError,
  } = await supabase
    .from("orders")
    .select(`
      id,
      status
    `)
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (!order) {
    return {
      success: false,
      error: "Order not found",
      status: 404,
    };
  }

  if (
    !["pending", "confirmed"].includes(
      order.status,
    )
  ) {
    return {
      success: false,
      error:
        "This order can no longer be cancelled",
      status: 400,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
    })
    .eq("id", orderId)
    .eq("user_id", userId)
    .select(ORDER_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return {
    success: true,
    message:
      "Order cancelled successfully",
    data,
  };
}


/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL ORDERS
|--------------------------------------------------------------------------
*/


export async function getAllOrders({
  page = 1,
  limit = 20,
  status,
  paymentStatus,
  search,
}) {
  const safePage = Math.max(
    Number(page) || 1,
    1,
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100,
  );

  const from =
    (safePage - 1) * safeLimit;

  const to =
    from + safeLimit - 1;


  let query = supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        user_id,
        address_id,
        status,
        payment_status,
        payment_method,
        subtotal,
        shipping_cost,
        total,
        created_at,
        updated_at,

        users (
          id,
          username,
          email
        ),

        addresses (
          id,
          full_name,
          phone,
          city,
          state,
          pincode
        ),

        order_items (
          id,
          product_name,
          color,
          size,
          sku,
          price,
          quantity,
          image_url
        )
      `,
      {
        count: "exact",
      },
    )
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);


  if (status) {
    query = query.eq(
      "status",
      status,
    );
  }


  if (paymentStatus) {
    query = query.eq(
      "payment_status",
      paymentStatus,
    );
  }


  if (search) {
    query = query.ilike(
      "order_number",
      `%${search}%`,
    );
  }


  const {
    data,
    error,
    count,
  } = await query;

  if (error) {
    throw error;
  }

  return {
    success: true,

    data: data || [],

    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count || 0,
      totalPages: Math.ceil(
        (count || 0) / safeLimit,
      ),
    },
  };
}


/*
|--------------------------------------------------------------------------
| ADMIN - GET SINGLE ORDER
|--------------------------------------------------------------------------
*/


export async function getAdminOrder(
  orderId,
) {
  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      user_id,
      address_id,
      status,
      payment_status,
      payment_method,
      subtotal,
      shipping_cost,
      total,
      created_at,
      updated_at,

      users (
        id,
        username,
        email
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
        pincode
      ),

      order_items (
        id,
        order_id,
        product_variant_id,
        product_id,
        product_name,
        brand,
        color,
        size,
        sku,
        image_url,
        price,
        quantity,
        created_at
      ),

      payments (
        id,
        order_id,
        payment_method,
        payment_status,
        transaction_id,
        amount,
        paid_at,
        created_at
      )
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      success: false,
      error: "Order not found",
      status: 404,
    };
  }

  return {
    success: true,
    data,
  };
}


/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE ORDER
|--------------------------------------------------------------------------
*/


export async function updateAdminOrder(
  orderId,
  updates,
) {
  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const allowedPaymentStatuses = [
    "pending",
    "paid",
    "failed",
    "refunded",
  ];

  const allowedPaymentMethods = [
    "COD",
    "UPI",
    "Card",
    "Net Banking",
  ];

  const updateData = {};


  /*
   * Order status
   */

  if (updates.status !== undefined) {
    if (
      !allowedStatuses.includes(
        updates.status,
      )
    ) {
      return {
        success: false,
        error: "Invalid order status",
        status: 400,
      };
    }

    updateData.status =
      updates.status;
  }


  /*
   * Payment status
   */

  if (
    updates.payment_status !==
    undefined
  ) {
    if (
      !allowedPaymentStatuses.includes(
        updates.payment_status,
      )
    ) {
      return {
        success: false,
        error: "Invalid payment status",
        status: 400,
      };
    }

    updateData.payment_status =
      updates.payment_status;
  }


  /*
   * Payment method
   */

  if (
    updates.payment_method !==
    undefined
  ) {
    if (
      !allowedPaymentMethods.includes(
        updates.payment_method,
      )
    ) {
      return {
        success: false,
        error: "Invalid payment method",
        status: 400,
      };
    }

    updateData.payment_method =
      updates.payment_method;
  }


  if (
    Object.keys(updateData).length === 0
  ) {
    return {
      success: false,
      error: "No valid fields to update",
      status: 400,
    };
  }


  /*
   * Update order
   */

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select(ORDER_SELECT)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      success: false,
      error: "Order not found",
      status: 404,
    };
  }


  /*
   * Keep payment record synchronized.
   */

  if (
    updates.payment_status !==
    undefined
  ) {
    const paymentUpdate = {
      payment_status:
        updates.payment_status,
    };

    if (
      updates.payment_status ===
      "paid"
    ) {
      paymentUpdate.paid_at =
        new Date().toISOString();
    }

    const {
      error: paymentError,
    } = await supabase
      .from("payments")
      .update(paymentUpdate)
      .eq("order_id", orderId);

    if (paymentError) {
      throw paymentError;
    }
  }


  /*
   * Return fresh order.
   */

  const result =
    await getAdminOrder(orderId);

  return {
    success: true,
    message:
      "Order updated successfully",
    data: result.data,
  };
}

