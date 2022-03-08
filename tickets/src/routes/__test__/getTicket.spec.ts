import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('return 404 if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('return 200 and a ticket if it was found', async () => {
  const ticketData = {
    title: 'Ticket1',
    price: 20,
  };
  const {
    body: { id },
  } = await request(app).post('/api/tickets').set('Cookie', signin()).send(ticketData).expect(201);
  const response = await request(app).get(`/api/tickets/${id}`).send().expect(200);

  expect(response.body.title).toEqual(ticketData.title);
  expect(response.body.price).toEqual(ticketData.price);
});
