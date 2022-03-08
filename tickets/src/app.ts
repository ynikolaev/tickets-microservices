import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@yn-projects/common';

import { createTicketRouter } from './routes/createTicket';
import { getTicketRouter } from './routes/getTicket';
import { getTicketsRouter } from './routes/getTickets';
import { updateTicketRouter } from './routes/updateTicket';

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

app.use(getTicketRouter);
app.use(getTicketsRouter);
app.use(createTicketRouter);
app.use(updateTicketRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

// Error handling
app.use(errorHandler);

export { app };
