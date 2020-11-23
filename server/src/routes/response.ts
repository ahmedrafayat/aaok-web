import { Router } from 'express';
import FormResponseController = require('../controllers/FormResponseController');

const router = Router();

router.post('/:formId', FormResponseController.submitForm);

router.get('/', FormResponseController.getResponseWithPagination);

module.exports = router;
