import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import chalk from 'chalk';
import cors from 'cors';
import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import { auth } from './lib/auth.js';

const app: Application = express();
const port = process.env.PORT ?? 3000;

const whitelist = ['http://localhost:5173'];
const corsOptions = {
  credentials: true,
  origin: whitelist,
};

export async function authenticatedUser(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  console.log({ session });
  if (!session?.user) {
    res.status(403).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

app.use(cors(corsOptions));

app.set('trust proxy', true);

app.get('/', (req: Request, res: Response) => {
  res.json({ msg: 'Server healthy' });
});

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.get('/protected', authenticatedUser, (req: Request, res: Response) => {
  res.json(['This is protected Information']);
});

app.listen(port, () => console.log(chalk.bgGreen(` Server listening on port ${port} `)));
