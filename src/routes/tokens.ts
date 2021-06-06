import Router = require('express');
import { TokenController } from '../controllers/TokenController';

const router = Router();

router.post('/create', TokenController.createNewToken);

export const TokenRouter = router;
