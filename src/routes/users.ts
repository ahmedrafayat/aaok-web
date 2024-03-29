import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();

router.get('/', UserController.getUsers);

router.get('/name', UserController.getUserByName);

router.get('/get-disabled-users', UserController.getDisabledUsersAfterLastEnabled);

router.patch('/change-status/:userId', UserController.changeStatus);

router.patch('/change-admin-status/:userId', UserController.changeAdminStatus);

export const UserRouter = router;
