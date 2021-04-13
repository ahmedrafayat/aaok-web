import { Router } from 'express';
import { FormResponseController } from '../controllers/FormResponseController';

const router = Router();

router.post('/:formId', FormResponseController.submitForm);

router.get('/', FormResponseController.getResponses);

router.get('/csv', FormResponseController.getCsvGenerationData);

router.get('/:responseId', FormResponseController.getResponse);

router.patch('/:responseId', FormResponseController.saveAdminFields);

export const FormResponseRouter = router;
