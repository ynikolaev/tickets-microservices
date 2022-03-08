import request from 'supertest';
import { app } from '../../app';

const createTicket = (num: number) => {
  const ticketData = {
    title: `Ticket${num}`,
    price: num + 134,
  };
  return request(app).post('/api/tickets').set('Cookie', signin()).send(ticketData);
};

it('can fetch a list of tickets', async () => {
  await createTicket(11);
  await createTicket(12);
  await createTicket(13);

  const response = await request(app).get('/api/tickets/').send().expect(200);
  expect(response.body.length).toEqual(3);
});
