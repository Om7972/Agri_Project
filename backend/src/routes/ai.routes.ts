import { Router } from 'express';
import { AiController } from '@/controllers/ai.controller';
import { authenticate } from '@/middlewares/auth';
import { validate } from '@/middlewares/validator';
import { pricePredictionSchema, aiChatSchema, chatSessionCreateSchema } from '@/validators/ai';

const router = Router();

/**
 * @openapi
 * /ai/predict:
 *   post:
 *     summary: Predict crop prices using AI
 *     description: Computes expected market prices, confidence ratings, and trend alerts based on crop attributes, location, and volumes.
 *     tags:
 *       - AI Engine
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - crop
 *               - quantity
 *               - location
 *             properties:
 *               crop:
 *                 type: string
 *                 example: Wheat
 *               quantity:
 *                 type: number
 *                 example: 25
 *               location:
 *                 type: string
 *                 example: Punjab
 *     responses:
 *       200:
 *         description: Price prediction computed successfully.
 */
router.post('/predict', validate(pricePredictionSchema), AiController.predict);

/**
 * @openapi
 * /ai/match:
 *   get:
 *     summary: Compute buyer-seller match rating
 *     description: Generates a matching score based on proximity, credentials, ratings, and listing categories.
 *     tags:
 *       - AI Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: buyerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match score calculated successfully.
 */
router.get('/match', authenticate, AiController.match);

/**
 * @openapi
 * /ai/recommend:
 *   get:
 *     summary: Get tailored crop suggestions
 *     description: Returns best matching sellers, buyers, and active listings customized for the active user role.
 *     tags:
 *       - AI Engine
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully.
 */
router.get('/recommend', authenticate, AiController.recommend);

/**
 * @openapi
 * /ai/intelligence:
 *   get:
 *     summary: Fetch market supply, demand and price metrics
 *     description: Returns consolidated volume supplies, transactional purchase requests, and historical unit prices.
 *     tags:
 *       - AI Engine
 *     responses:
 *       200:
 *         description: Market intelligence data retrieved successfully.
 */
router.get('/intelligence', AiController.getIntelligence);

/**
 * @openapi
 * /ai/chat/sessions:
 *   post:
 *     summary: Initiate a chat session with the AI Assistant
 *     tags:
 *       - AI Assistant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat session initiated successfully.
 */
router.post('/chat/sessions', authenticate, validate(chatSessionCreateSchema), AiController.createChatSession);

/**
 * @openapi
 * /ai/chat/sessions:
 *   get:
 *     summary: List user's active AI chat sessions
 *     tags:
 *       - AI Assistant
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat sessions retrieved successfully.
 */
router.get('/chat/sessions', authenticate, AiController.getChatSessions);

/**
 * @openapi
 * /ai/chat/sessions/{id}/messages:
 *   get:
 *     summary: Fetch discussion transcripts for a chat session
 *     tags:
 *       - AI Assistant
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
 *         description: Chat history retrieved successfully.
 */
router.get('/chat/sessions/:id/messages', authenticate, AiController.getChatMessages);

/**
 * @openapi
 * /ai/chat/sessions/{id}/messages:
 *   post:
 *     summary: Send message to the AI Assistant
 *     tags:
 *       - AI Assistant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: How does the Smart Escrow system protect my wheat export?
 *     responses:
 *       200:
 *         description: Reply processed successfully.
 */
router.post('/chat/sessions/:id/messages', authenticate, validate(aiChatSchema), AiController.sendChatMessage);

export default router;
