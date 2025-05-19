import { Router } from 'express';
import deviceRouter from './devices/device.routes';

const router = Router();

router.use('/devices', deviceRouter);

export default router;
