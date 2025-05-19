import { deviceController } from '@controllers/device.controller';
import { Router } from 'express';

const router = Router();

router.get('/', deviceController.getAllDevices);

export default router;
