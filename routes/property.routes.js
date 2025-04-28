import express from 'express';
const router = express.Router(); 
import { authenticateUser } from '../middleware/Authmiddleware.js';
import {  uploadPropertyMedia } from '../utils/docUpload.js';
import { addProperty, changeStatusOfProperty, getAllProperties, getPropertyByBrokerId, getPropertyById, getPropertyListByUserRequirement, updateProperty } from '../controllers/property.controller.js';



router.post('/addproperty', authenticateUser, uploadPropertyMedia, addProperty);

router.get('/getbyid/:id',authenticateUser,getPropertyById);

router.get('/getbybrokerid/:userId',authenticateUser,getPropertyByBrokerId); 

router.put('/updateproperty/:id', authenticateUser, uploadPropertyMedia, updateProperty); 

router.put('/changestatus/:id', authenticateUser, changeStatusOfProperty); 





//Admin routes
router.get('/getallproperties', authenticateUser, getAllProperties);

router.get('/getpropertylistbyuserrequirement/:userId', authenticateUser, getPropertyListByUserRequirement); 




export default router; 