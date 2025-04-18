import express from 'express';
import { getAreaList } from '../controllers/area.controller.js';
const router = express.Router(); // ✅ THIS LINE WAS MISSING

// Route to get a paginated list of areas
router.get('/getlist', getAreaList);

export default router;