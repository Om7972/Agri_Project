import { Router } from 'express';
import { ProductController } from '@/controllers/product.controller';
import { authenticate } from '@/middlewares/auth';
import { authorize } from '@/middlewares/roles';
import { validate } from '@/middlewares/validator';
import { upload } from '@/middlewares/upload';
import { createProductSchema, updateProductSchema } from '@/validators/products';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retrieve products list
 *     description: Lists active products with pagination, search queries, min/max price thresholds, and category filters.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keywords for title or crop type.
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category UUID.
 *       - in: query
 *         name: cropType
 *         schema:
 *           type: string
 *         description: Filter by crop (e.g. Wheat, Rice).
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *         description: Filter by crop grade (e.g. Grade A+).
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Products retrieved successfully.
 */
router.get('/', ProductController.list);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully.
 *       404:
 *         description: Product not found.
 */
router.get('/:id', ProductController.getById);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create product listing
 *     description: Creates a new agricultural commodity contract (Restricted to FARMER, EXPORTER, ADMIN).
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - unit
 *               - stock
 *               - cropType
 *               - grade
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 example: Premium Basmati Rice Batch 10
 *               description:
 *                 type: string
 *                 example: Long-grain, aged for 12 months, moisture below 12%.
 *               price:
 *                 type: number
 *                 example: 3600
 *               unit:
 *                 type: string
 *                 example: Quintal
 *               stock:
 *                 type: number
 *                 example: 450
 *               cropType:
 *                 type: string
 *                 example: Rice
 *               grade:
 *                 type: string
 *                 example: Grade A+
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product listing created successfully.
 *       401:
 *         description: Unauthenticated.
 *       403:
 *         description: Forbidden role.
 */
router.post(
  '/',
  authenticate,
  authorize(Role.FARMER, Role.EXPORTER, Role.ADMIN),
  upload.single('image'),
  validate(createProductSchema),
  ProductController.create
);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Update product listing
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product listing updated successfully.
 */
router.put(
  '/:id',
  authenticate,
  authorize(Role.FARMER, Role.EXPORTER, Role.ADMIN),
  upload.single('image'),
  validate(updateProductSchema),
  ProductController.update
);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Delete/Archive product listing
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product listing archived successfully.
 */
router.delete(
  '/:id',
  authenticate,
  authorize(Role.FARMER, Role.EXPORTER, Role.ADMIN),
  ProductController.delete
);

export default router;
