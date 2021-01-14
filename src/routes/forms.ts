import { Router } from 'express';
import { FormController } from '../controllers/FormController';

const router = Router();

// Fetch all forms
router.get('/fields', FormController.getFormsWithFields);

router.get('/name', FormController.getFormsByName);

// Create a new form
router.post('/', FormController.createNewForm);

export const FormRouter = router;
