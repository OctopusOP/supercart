
// services/cart.service.js

import supabase from "@/db/supabase";

const CART_SELECT = `
  id,
  session_id,
  product_variant_id,
  quantity,
  created_at,
  updated_at,

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
      brand,
      description
    ),

    variant_images (
      id,
      image_url,
      display_order
    )
  )
`;

// ============================================
// GET CART
// ============================================

export const getCart = async (sessionId) => {
  if (!sessionId) {
    return {
      items: [],
      totalItems: 0,
      subtotal: 0,
    };
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }

  const items = data || [];

  const totalItems = items.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const subtotal = items.reduce((total, item) => {
    const price = Number(
      item.product_variants?.price || 0
    );

    const quantity = Number(item.quantity || 0);

    return total + price * quantity;
  }, 0);

  return {
    items,
    totalItems,
    subtotal,
  };
};

// ============================================
// GET CART ITEM
// ============================================

export const getCartItem = async (
  sessionId,
  itemId
) => {
  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("id", itemId)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching cart item:", error);
    throw error;
  }

  return data;
};

// ============================================
// GET CART ITEM BY VARIANT
// ============================================

export const getCartItemByVariant = async (
  sessionId,
  variantId
) => {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("session_id", sessionId)
    .eq("product_variant_id", variantId)
    .maybeSingle();

  if (error) {
    console.error(
      "Error checking cart variant:",
      error
    );

    throw error;
  }

  return data;
};

// ============================================
// GET PRODUCT VARIANT
// ============================================

export const getProductVariant = async (
  variantId
) => {
  const { data, error } = await supabase
    .from("product_variants")
    .select(`
      id,
      color,
      size,
      price,
      stock,
      sku,

      products (
        id,
        name,
        brand,
        description
      ),

      variant_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq("id", variantId)
    .maybeSingle();

  if (error) {
    console.error(
      "Error fetching product variant:",
      error
    );

    throw error;
  }

  return data;
};

// ============================================
// ADD CART ITEM
// ============================================

export const addCartItem = async ({
  sessionId,
  variantId,
  quantity = 1,
}) => {
  const requestedQuantity = Number(quantity);

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity <= 0
  ) {
    return {
      success: false,
      error: "Invalid quantity",
    };
  }

  const variant = await getProductVariant(variantId);

  if (!variant) {
    return {
      success: false,
      error: "Product variant not found",
    };
  }

  const stock = Number(variant.stock || 0);

  if (stock <= 0) {
    return {
      success: false,
      error: "Product is out of stock",
    };
  }

  const existing = await getCartItemByVariant(
    sessionId,
    variantId
  );

  if (existing) {
    const newQuantity =
      Number(existing.quantity) + requestedQuantity;

    if (newQuantity > stock) {
      return {
        success: false,
        error: `Only ${stock} item(s) available`,
      };
    }

    const { data, error } = await supabase
      .from("cart_items")
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("session_id", sessionId)
      .select(CART_SELECT)
      .single();

    if (error) {
      console.error(
        "Error updating cart item:",
        error
      );

      throw error;
    }

    return {
      success: true,
      message: "Cart quantity updated",
      data,
    };
  }

  if (requestedQuantity > stock) {
    return {
      success: false,
      error: `Only ${stock} item(s) available`,
    };
  }

  const { data, error } = await supabase
    .from("cart_items")
    .insert({
      session_id: sessionId,
      product_variant_id: variantId,
      quantity: requestedQuantity,
    })
    .select(CART_SELECT)
    .single();

  if (error) {
    console.error(
      "Error adding cart item:",
      error
    );

    throw error;
  }

  return {
    success: true,
    message: "Product added to cart",
    data,
  };
};

// ============================================
// UPDATE CART ITEM QUANTITY
// ============================================

export const updateCartItemQuantity = async ({
  sessionId,
  itemId,
  quantity,
}) => {
  const newQuantity = Number(quantity);

  if (
    !Number.isInteger(newQuantity) ||
    newQuantity <= 0
  ) {
    return {
      success: false,
      error: "Invalid quantity",
    };
  }

  const item = await getCartItem(
    sessionId,
    itemId
  );

  if (!item) {
    return {
      success: false,
      error: "Cart item not found",
    };
  }

  const stock = Number(
    item.product_variants?.stock || 0
  );

  if (stock <= 0) {
    return {
      success: false,
      error: "Product is out of stock",
    };
  }

  if (newQuantity > stock) {
    return {
      success: false,
      error: `Only ${stock} item(s) available`,
    };
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("session_id", sessionId)
    .select(CART_SELECT)
    .single();

  if (error) {
    console.error(
      "Error updating cart quantity:",
      error
    );

    throw error;
  }

  return {
    success: true,
    message: "Cart updated",
    data,
  };
};

// ============================================
// REMOVE CART ITEM
// ============================================

export const removeCartItem = async ({
  sessionId,
  itemId,
}) => {
  const { data, error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("session_id", sessionId)
    .select()
    .maybeSingle();

  if (error) {
    console.error(
      "Error removing cart item:",
      error
    );

    throw error;
  }

  if (!data) {
    return {
      success: false,
      error: "Cart item not found",
    };
  }

  return {
    success: true,
    message: "Item removed from cart",
    data,
  };
};

// ============================================
// CLEAR CART
// ============================================

export const clearCart = async (sessionId) => {
  if (!sessionId) {
    return {
      success: true,
      message: "Cart already empty",
    };
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("session_id", sessionId);

  if (error) {
    console.error(
      "Error clearing cart:",
      error
    );

    throw error;
  }

  return {
    success: true,
    message: "Cart cleared",
  };
};

