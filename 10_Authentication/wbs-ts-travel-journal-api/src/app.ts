import '#db';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { CLIENT_BASE_URL } from '#config';
import { errorHandler, notFoundHandler } from '#middlewares';
import { authRouter, postRouter } from '#routes';

const app = express();
const port = process.env.PORT || '3000';

/** Used to verify Render.com re-deploys: new deploy = new startedAt */
const startedAt = new Date().toISOString();

app.use(
  cors({
    origin: CLIENT_BASE_URL, // for use with credentials, origin(s) need to be specified
    credentials: true // sends and receives secure cookies
  })
);

app.use(express.json(), cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', startedAt });
});

app.use('/auth', authRouter);
app.use('/posts', postRouter);

app.use('*splat', notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Auth Server listening on port ${port}`);
});
