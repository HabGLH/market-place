import { z } from "zod";

const objectId = z.string().regex(/^[\da-f]{24}$/i, "Invalid ID");
const email = z.string().trim().email().max(254);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email,
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: email.optional(),
  password: z.string().min(8).max(128).optional(),
  currentPassword: z.string().min(1).max(128).optional(),
});

export const addToCartSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1).max(100),
});

export const updateCartSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(0).max(100),
});

const productFields = {
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(10000),
  price: z.coerce.number().finite().min(0),
  category: z.string().trim().min(1).max(100),
  stock: z.coerce.number().int().min(0),
  images: z.array(z.string().trim().min(1).max(2048)).max(5).optional(),
  image: z.string().optional(),
};

const normalizeProductImages = ({ image, images, ...data }) => ({
  ...data,
  ...(images !== undefined ? { images } : image ? { images: [image] } : {}),
});

export const createProductSchema = z
  .object(productFields)
  .transform(normalizeProductImages);
export const updateProductSchema = z
  .object(productFields)
  .partial()
  .refine(
    (body) => Object.keys(body).length > 0,
    "Provide at least one field to update",
  )
  .transform(normalizeProductImages);

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  q: z.string().trim().max(200).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  sort: z
    .enum(["newest", "oldest", "price_asc", "price_desc", "name_asc"])
    .default("newest"),
});

export const productIdParamsSchema = z.object({ id: objectId });
export const cartProductIdParamsSchema = z.object({ productId: objectId });
export const stockSchema = z.object({ stock: z.coerce.number().int().min(0) });

export const createOrderSchema = z.object({
  paymentMethod: z.string().trim().min(1).max(60).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["Pending", "Shipped", "Delivered", "Cancelled"]),
});

export const orderIdParamsSchema = z.object({ id: objectId });
export const orderListQuerySchema = z.object({
  status: z.enum(["Pending", "Shipped", "Delivered", "Cancelled"]).optional(),
});

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .regex(
      /^\+251[79]\d{8}$/,
      "Use Ethiopian phone format +2519xxxxxxxx or +2517xxxxxxxx",
    ),
  city: z.string().trim().min(1).max(100),
  subCity: z.string().trim().min(1).max(100),
  addressLine: z.string().trim().min(3).max(300),
  landmark: z.string().trim().max(200).optional(),
});

export const paymentCheckoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["chapa", "cod"]),
});
