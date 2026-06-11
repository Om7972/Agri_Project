import { Router } from 'express';
import { OrderController } from '@/controllers/order.controller';
import { authenticate } from '@/middlewares/auth';
import { validate } from '@/middlewares/validator';
import { createOrderSchema, updateOrderStatusSchema } from '@/validators/orders';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), OrderController.create);
router.get('/', OrderController.listMyOrders);
router.get('/:id', OrderController.getById);
router.patch('/:id/status', validate(updateOrderStatusSchema), OrderController.updateStatus);

export default router;
