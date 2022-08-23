import { Router } from 'express';
import metalogger from 'metalogger';
import qs         from 'qs';
import Auth       from '../../modules/auth/index.js';

import Email from '../../modules/email/index.js';
import Users from '../../modules/users/index.js';

const log   = metalogger();
const users = new Users();
const email = new Email();
const auth  = new Auth();

const front       = process.env.SELF_FRONT;
const admin_front = process.env.SELF_ADMIN_FRONT;

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
  const scope                 = req.get('x-authenticated-scope');
  const custom_id             = req.get('x-consumer-custom-id');
  const [user_id, company_id] = custom_id?.split('_') ?? [];

  if (user_id?.length > 0 && company_id?.length > 0 && scope?.length > 0) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
    log.info('Unauthorized', JSON.stringify({ scope, custom_id, user_id, company_id }));
  }
});

router.delete('/logout', async (req, res) => {
  res.sendStatus(202);

  try {
    const user_id = req.get('x-authenticated-userid');
    await auth.logoutAll(user_id, req.body.token);
  } catch (e) {
    console.log(e);
    log.warning(e);
  }
});

router.post('/login', async (req, res) => {
  res.sendStatus(202);
  try {
    const user = await users.authenticate(req.body.email);

    if (req.body.type === 'admin' && user.type !== 'admin') {
      await users.resetCode(user.uuid);
      return log.error('wrong login type', user);
    }

    const payload = {
      code:  user.code,
      email: user.email,
    };
    await email.sendAuth(user.email, `https://${front}/auth/authenticate/?${qs.stringify(payload)}`, user.code);
  } catch (e) {
    console.log(e);
    log.warning(e);
  }
});

router.post('/authenticate', async (req, res) => {
  const code  = req.body.code;
  const email = req.body.email;

  try {
    const user = await users.byCode(code);

    if (user.email !== email) {
      console.log(email, '!=', user.email);
      return res.sendStatus(404);
    }
    let updated_at = new Date(user.updated);
    updated_at.setTime(updated_at.getTime() + 5 * 60000);
    if (user.email === 'demo@example.com') {
      updated_at.setTime(new Date().getTime() + 60000);
    }

    if (user.code === code && updated_at > new Date()) {
      const tokens = await auth.authUser(user.uuid, user.company_uuid, user.type);

      if (user.email !== 'demo@example.com') {
        await users.resetCode(user.uuid);
      }

      res.json(tokens);
    } else {
      console.log(code, user.code, updated_at);
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    log.error(e.message);
    res.sendStatus(404);
  }
});

router.all('*', (req, res) => {
  res.sendStatus(403);

  console.log('auth_dump', {
    method: req.method,
    url:    req.url,
    query:  req.query,
    body:   req.body,
  });
});

export default router;
