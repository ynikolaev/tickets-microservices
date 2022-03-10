import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@yn-projects/common';

import { getOrdersRouter } from './routes/getOrders';
import { getOrderRouter } from './routes/getOrder';
import { createOrderRouter } from './routes/createOrder';
import { deleteOrderRouter } from './routes/deleteOrder';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(getOrdersRouter);
app.use(getOrderRouter);
app.use(createOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

// Error handling
app.use(errorHandler);

export { app };
