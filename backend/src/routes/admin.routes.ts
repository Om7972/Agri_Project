import { Router } from 'express';
import { AdminController } from '@/controllers/admin.controller';
import { authenticate } from '@/middlewares/auth';
import { authorize } from '@/middlewares/roles';
import { Role } from '@prisma/client';

const router = Router();

// Secure all admin routes with authentication and strict admin RBAC
router.use(authenticate, authorize(Role.ADMIN));

router.get('/users', AdminController.listUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.delete('/users/:id', AdminController.deleteUser);

router.patch('/products/:id/verify', AdminController.verifyProductGrade);
router.patch('/auctions/:id/cancel', AdminController.cancelAuction);

router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
