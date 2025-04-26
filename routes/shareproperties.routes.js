import express from 'express';
const router = express.Router(); 
import { authenticateUser } from '../middleware/Authmiddleware.js';
import { getPropertiesByUserId, getPropertyById, sharePropertyToCustomer } from '../controllers/shareproperties.controller.js';

router.post('/customer', authenticateUser,sharePropertyToCustomer);

router.get('/getproperties/:userId', authenticateUser, getPropertiesByUserId); // Assuming you have a getPropertyById function in your controller

router.get('/getbyid/:id', authenticateUser, getPropertyById); // Assuming you have a getPropertyById function in your controller

export default router; 