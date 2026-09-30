import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  enableProduct,
  updateStock,
} from "../controllers/productController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  createProductSchema,
  productIdParamsSchema,
  productListQuerySchema,
  stockSchema,
  updateProductSchema,
} from "../validation/schemas.js";

const router = express.Router();

/* =====================
   PUBLIC ROUTES
===================== */
router.get(
  "/",
  validateRequest({ query: productListQuerySchema }),
  getAllProducts,
); // GET /api/products

/* =====================
   ADMIN ROUTES (STATIC FIRST)
===================== */
router.get("/admin", authenticateToken, roleMiddleware(), getAdminProducts);

router.post(
  "/",
  authenticateToken,
  roleMiddleware(),
  validateRequest({ body: createProductSchema }),
  createProduct,
);

router.put(
  "/:id/enable",
  authenticateToken,
  roleMiddleware(),
  validateRequest({ params: productIdParamsSchema }),
  enableProduct,
);
router.put(
  "/:id/stock",
  authenticateToken,
  roleMiddleware(),
  validateRequest({
    params: productIdParamsSchema,
    body: stockSchema,
  }),
  updateStock,
);

/* =====================
   DYNAMIC ROUTES (LAST)
===================== */
router.get(
  "/:id",
  validateRequest({ params: productIdParamsSchema }),
  getProductById,
);

router.put(
  "/:id",
  authenticateToken,
  roleMiddleware(),
  validateRequest({
    params: productIdParamsSchema,
    body: updateProductSchema,
  }),
  updateProduct,
);

router.delete(
  "/:id",
  authenticateToken,
  roleMiddleware(),
  validateRequest({ params: productIdParamsSchema }),
  deleteProduct,
);

export default router;
