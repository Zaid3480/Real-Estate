import express from 'express';
import { authenticateUser } from '../middleware/Authmiddleware.js';
import {  getAllSupportRequestFromUserId, getSupportById, getSupportByUserId, supportCustomer } from '../controllers/support.controller.js';
import { uploadSingle } from '../utils/docUpload.js'; 
import multer from 'multer';

const router = express.Router(); // ✅ THIS LINE WAS MISSING

router.post('/tenant', authenticateUser, uploadSingle, supportCustomer);

router.get('/getsupportbyid/:id',authenticateUser,getSupportById); // Assuming you have a getSupportById function in your controller

router.get('/getsupportbyuserId/:userId',authenticateUser,getSupportByUserId); // Assuming you have a getSupportById function in your controller

router.get('/getallsupportrequest/:userId',authenticateUser,getAllSupportRequestFromUserId); // Assuming you have a getSupportById function in your controller


export default router;