import { deviceController } from '@controllers/device.controller';
import { Router } from 'express';

const router = Router();

router.get('/', deviceController.getAllPaginated);
router.get('/all', deviceController.getAllDevices);

export default router;
