import { Router } from 'express';
import metalogger from 'metalogger';
import Auth       from '../../modules/auth/index.js';

const router = Router({ mergeParams: true });
const log    = metalogger();
const auth   = new Auth();

router.delete('/logout', async (req, res) => {
  res.sendStatus(202);
  try {
    await auth.logoutAll(req.body.user_id, req.body.token);
  } catch (e) {
    console.log(e);
    log.warning(e);
  }
});

export default router;
