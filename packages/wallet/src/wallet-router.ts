import { Router, json } from 'express';
import { getApplePass } from './controllers/apple-wallet-controller.js';

/**
 * public
 *
 */
export const WalletRouter = (args: any): Router => {
  const router = Router();
  router.use(json({ limit: '10mb' }));

  router.get('/credentials/:hash/apple-pass', (req: any, res: any) =>
    getApplePass(req, res, args)
  );
  return router;
};
