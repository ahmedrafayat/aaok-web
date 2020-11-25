import { Router } from 'express';
import FormController = require('../controllers/FormController');

const router = Router();

// Fetch all forms
router.get('/fields', FormController.getFormsWithFields);

router.get('/', FormController.getForms);

// Create a new form
router.post('/', FormController.createNewForm);

module.exports = router;
