import express from 'express';
const router = express.Router(); 
import { authenticateUser } from '../middleware/Authmiddleware.js';
import { changeStatus, getCustomerListOfShareProperty, getPropertiesByUserId, getPropertyById, sharePropertyToCustomer } from '../controllers/shareproperties.controller.js';

router.post('/customer', authenticateUser,sharePropertyToCustomer);

router.get('/getproperties/:userId', authenticateUser,getPropertiesByUserId);

router.get('/getbyid/:id', authenticateUser,getPropertyById); 

router.get('/getcustomer/:propertyId', authenticateUser,getCustomerListOfShareProperty); 

router.put('/changestatus/:id', authenticateUser,changeStatus);

export default router; 

