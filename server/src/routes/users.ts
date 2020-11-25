import { Router } from 'express';
import UserController = require('../controllers/UserController');

const router = Router();

router.get('/', UserController.getUsers);

export = router;
