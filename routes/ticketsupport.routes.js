import express from 'express';
import { authenticateUser } from '../middleware/Authmiddleware.js';
import { createTicket, getAllTicketsByUserId } from '../controllers/ticketsupport.controller.js';

const router = express.Router(); 

router.get('/getallbyuserid/:id', authenticateUser, getAllTicketsByUserId);

router.post('/create',authenticateUser,createTicket); // Assuming you have a createTicket function in your controller

export default router;