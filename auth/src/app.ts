import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@yn-projects/common';

import { currentUserRouter } from './routes/current-user';
import { signinUserRouter } from './routes/signin';
import { signoutUserRouter } from './routes/signout';
import { signupUserRouter } from './routes/signup';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUserRouter);
app.use(signinUserRouter);
app.use(signoutUserRouter);
app.use(signupUserRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

// Error handling
app.use(errorHandler);

export { app };
