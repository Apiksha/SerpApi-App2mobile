import express from 'express';
import * as resultsController from '../controllers/resultsController.js';

const router = express.Router();

router.post('/bulk', resultsController.createManyResults);

router.post('/', resultsController.createResult);

router.get('/', resultsController.getAllResults);

router.get('/:id', resultsController.getResultById);

router.put('/:id', resultsController.updateResult);

router.delete('/:id', resultsController.deleteResult);

export default router;