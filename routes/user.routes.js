import express from 'express';
import { body } from 'express-validator';
import { otpVerification, userLogin, userProfile, userRegistration } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/Authmiddleware.js';
const router = express.Router(); // ✅ THIS LINE WAS MISSING

// Customer (Tenant) Registration
router.post('/register', [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('mobileNo').notEmpty().withMessage('Mobile number is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('address').notEmpty().withMessage('Address is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 6 characters long')
], userRegistration);

// Customer (Tenant) Login
router.post('/login', [
    body('mobileNo').notEmpty().withMessage('Mobile number is required'),
    body('password').notEmpty().withMessage('Password is required')
], userLogin);

router.post('/verify-otp', [
    body('mobileNo').notEmpty().withMessage('Mobile number is required'),
    body('otp').notEmpty().withMessage('OTP is required')
], otpVerification); // Assuming userLogin handles OTP verification as well

router.get('/profile/:id',authenticateUser ,userProfile);




export default router;
