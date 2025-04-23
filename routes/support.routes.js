import express from 'express';
import { authenticateUser } from '../middleware/Authmiddleware.js';
import {  getAllSupportRequest, getAllSupportRequestFromUserId, getSupportById, getSupportByUserId, replyToCustomer, supportCustomer } from '../controllers/support.controller.js';
import { uploadSingle } from '../utils/docUpload.js'; 
import multer from 'multer';

const router = express.Router(); 

router.post('/tenant', authenticateUser, uploadSingle, supportCustomer);

router.get('/getsupportbyid/:id',authenticateUser,getSupportById); // Assuming you have a getSupportById function in your controller

router.get('/getsupportbyuserId/:userId',authenticateUser,getSupportByUserId); // Assuming you have a getSupportById function in your controller

router.get('/getallsupportrequest/:userId',authenticateUser,getAllSupportRequestFromUserId); // Assuming you have a getSupportById function in your controller


//Admin 
router.post('/replytocustomer/:id',authenticateUser,replyToCustomer); // Assuming you have a getSupportById function in your controller

router.get('/getallsupportrequest',authenticateUser,getAllSupportRequest); // Assuming you have a getSupportById function in your controller

export default router;