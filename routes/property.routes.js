import express from 'express';
const router = express.Router(); 
import { authenticateUser } from '../middleware/Authmiddleware.js';
import {  uploadPropertyMedia } from '../utils/docUpload.js';
import { addProperty, changeStatusOfProperty, getAllProperties, getBrokerDashboardData, getPropertyByBrokerId, getPropertyById, getPropertyListByUserRequirement, suggestedPropertiesToCustomerCount, updateProperty } from '../controllers/property.controller.js';



router.post('/addproperty', authenticateUser, uploadPropertyMedia, addProperty);

router.get('/getbyid/:id',authenticateUser,getPropertyById);

router.get('/getbybrokerid/:userId',authenticateUser,getPropertyByBrokerId); 

router.put('/updateproperty/:id', authenticateUser, uploadPropertyMedia, updateProperty); 

router.put('/changestatus/:id', authenticateUser, changeStatusOfProperty);

router.get('/suggestedproperties/:userId', authenticateUser, suggestedPropertiesToCustomerCount);

router.get('/brokerdashboard/:userId', authenticateUser, getBrokerDashboardData);





//Admin routes
router.get('/getallproperties', authenticateUser, getAllProperties);

router.get('/getpropertylistbyuserrequirement/:userId', authenticateUser, getPropertyListByUserRequirement); 




export default router; 