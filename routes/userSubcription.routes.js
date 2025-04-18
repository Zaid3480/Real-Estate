import express from 'express';
import { authenticateUser } from '../middleware/Authmiddleware.js';
import { updateUserSubscription, userSubscription } from '../controllers/userSubscription.controller.js';

const router = express.Router();


router.post('/userSubscription', authenticateUser, userSubscription);

router.put('/updateSubscription/:subscriptionId', authenticateUser, updateUserSubscription);



export default router;
