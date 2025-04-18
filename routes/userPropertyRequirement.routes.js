import express from 'express';
import { authenticateUser } from '../middleware/Authmiddleware.js';
import {  getRequirementFormsForUser, requirementFormUpdate, userPropertyRequirementForm } from '../controllers/userPropertyRequirement.controller.js';

const router = express.Router();

// Route to handle POST request for property requirement
router.post('/requirementForm', authenticateUser, userPropertyRequirementForm);

router.put('/requirementForm/:id', authenticateUser,requirementFormUpdate);

router.get('/getrequirementform', authenticateUser,getRequirementFormsForUser);



export default router;
