import supabase from "@/db/supabase";

const PRODUCT_SELECT = `
  id,
  name,
  description,
  brand,
  category_id,
  categories (
    id,
    name,
    slug
  ),
  product_variants (
    id,
    color,
    size,
    price,
    stock,
    sku,
    variant_images (
      id,
      image_url,
      display_order
    )
  )
`;


// ============================================
// GET ALL PRODUCTS
// ============================================

export const getAllProductDetails = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error("Error in getAllProductDetails:", error);
    return [];
  }
};


// ============================================
// GET SINGLE PRODUCT
// ============================================

export const getProductDetails = async (id) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    return data;

  } catch (error) {
    console.error("Error in getProductDetails:", error);
    return null;
  }
};


// ============================================
// UPDATE PRODUCT
// ============================================

export const updateProduct = async (id, productData) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({
        name: productData.name,
        description: productData.description,
        brand: productData.brand,
        category_id: productData.category_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return null;
    }

    return data;

  } catch (error) {
    console.error("Error in updateProduct:", error);
    return null;
  }
};


// ============================================
// ADD PRODUCT
// ============================================

export const addProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: productData.name,
        description: productData.description,
        brand: productData.brand,
        category_id: productData.category_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error);
      return null;
    }

    return data;

  } catch (error) {
    console.error("Error in addProduct:", error);
    return null;
  }
};