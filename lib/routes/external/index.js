import { Router } from 'express';
import auth       from './auth/index.js';

const router = Router({ mergeParams: true });

router.use('/', auth);

export default router;
