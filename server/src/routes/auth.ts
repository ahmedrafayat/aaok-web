import Router = require('express');
import AuthController = require('../controllers/AuthController');

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.delete('/logout', AuthController.logout);

export = router;
