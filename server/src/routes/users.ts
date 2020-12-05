import { Router } from 'express';
import UserController = require('../controllers/UserController');

const router = Router();

router.get('/', UserController.getUsers);

router.get('/name', UserController.getUserByName);

router.put('/change-status/:userId', UserController.changeStatus);

export const UserRouter = router;
