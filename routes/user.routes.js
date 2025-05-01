import express from 'express';
import { body } from 'express-validator';
import { activeOrDeactivateUser, deleteUser, editUser, exportExcelOfBrokers, exportExcelOfUsers, getAllBrokers, getAllUsers, getUserById, otpVerification, totalCountOfUsersandBrokers, userLogin, userProfile, userRegistration } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/Authmiddleware.js';

const router = express.Router(); 

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


//Api's for Admin
router.get("/getallusers",authenticateUser,getAllUsers);

router.get("/getuser/:id",authenticateUser,getUserById);

router.put("/activateuser/:id",authenticateUser,activeOrDeactivateUser);

router.put("/edituser/:id",authenticateUser,editUser);

router.delete("/deleteuser/:id",authenticateUser,deleteUser);

router.get('/totalcount', authenticateUser,totalCountOfUsersandBrokers);

router.get('/getallbrokers', authenticateUser,getAllBrokers);

//i want to export excel sheet of all users and brokers
router.get('/usersexcel', authenticateUser,exportExcelOfUsers);

router.get('/brokersexcel', authenticateUser,exportExcelOfBrokers);



export default router;
