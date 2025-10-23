import { Router } from 'express';
import { authenticateTokenMiddleware } from '../../middlewares/authenticateTokenMiddleware.js';
import { getMyPurchasedProducts } from '../controllers/UserController.js'; 

const router = Router();

router.use(authenticateTokenMiddleware);

router.get('/my-products', getMyPurchasedProducts);

export default router;