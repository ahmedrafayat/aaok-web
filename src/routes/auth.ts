import Router = require('express');
import { AuthController } from '../controllers/AuthController';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/admin/login', AuthController.adminLogin);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

export const AuthRouter = router;
