import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validate } from '@/middlewares/validator';
import { registerSchema, loginSchema, tokenRefreshSchema } from '@/validators/auth';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a user account (FARMER, BUYER, EXPORTER, ADMIN) along with an associated Profile.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: baldev@sukhmanifarms.com
 *               password:
 *                 type: string
 *                 minimum: 6
 *                 example: securePassword123
 *               role:
 *                 type: string
 *                 enum: [FARMER, BUYER, EXPORTER, ADMIN]
 *                 example: FARMER
 *               fullName:
 *                 type: string
 *                 example: Baldev Singh
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               companyName:
 *                 type: string
 *                 example: Sukhmani Agrotech Ltd
 *               address:
 *                 type: string
 *                 example: "12 Grand Trunk Road"
 *               city:
 *                 type: string
 *                 example: "Amritsar"
 *               country:
 *                 type: string
 *                 example: "India"
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Email in use or validation failure.
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates user credentials and returns JWT access and refresh tokens.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: baldev@sukhmanifarms.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful.
 *       419:
 *         description: Invalid credentials.
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     description: Takes a valid refresh token and issues a new access token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token refreshed successfully.
 *       419:
 *         description: Invalid refresh token.
 */
router.post('/refresh', validate(tokenRefreshSchema), AuthController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Revokes active session refresh token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully.
 */
router.post('/logout', validate(tokenRefreshSchema), AuthController.logout);

export default router;
