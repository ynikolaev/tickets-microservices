import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const ticketData = {
  title: 'test',
  price: 10,
};

it('returns 404 if provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signin())
    .send({
      title: 'test',
      price: 10,
    })
    .expect(404);
});

it('returns 401 if user not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'test',
      price: 10,
    })
    .expect(401);
});

it('returns 401 if user does not own ticket', async () => {
  const response = await request(app).post('/api/tickets').set('Cookie', signin()).send({
    title: ticketData.title,
    price: ticketData.price,
  });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', signin())
    .send({
      title: 'test',
      price: 20,
    })
    .expect(401);

  const result = await request(app).get(`/api/tickets/${response.body.id}`).send();

  expect(result.body.title).toEqual(ticketData.title);
  expect(result.body.price).toEqual(ticketData.price);
});

it('returns 400 if user provides invalid data or price', async () => {
  const userCookie = signin();
  const response = await request(app).post('/api/tickets').set('Cookie', userCookie).send({
    title: ticketData.title,
    price: ticketData.price,
  });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', userCookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', userCookie)
    .send({
      title: 'TicketUpdate',
      price: -20,
    })
    .expect(400);
});

it('returns 204 and updates a ticket with valid input', async () => {
  const userCookie = signin();
  const updatedTicket = {
    title: 'UpdatedTicket',
    price: 1000,
  };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', userCookie)
    .send({
      title: ticketData.title,
      price: ticketData.price,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', userCookie)
    .send({
      title: updatedTicket.title,
      price: updatedTicket.price,
    })
    .expect(200);

  const result = await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200);

  expect(result.body.title).toEqual(updatedTicket.title);
  expect(result.body.price).toEqual(updatedTicket.price);
});

it('returns 400 and rejects updates if the ticket is reserved', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const userCookie = signin(id);

  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    userId: id,
  });
  ticket.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const updatedTicket = {
    title: 'UpdatedTicket',
    price: 1000,
  };

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', userCookie)
    .send({
      title: updatedTicket.title,
      price: updatedTicket.price,
    })
    .expect(400);
});
