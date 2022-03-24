import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  const ticket = Ticket.build({
    title: 'Ticket1',
    price: 5,
    userId: '123',
  });

  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  await firstInstance!.save();
  try {
    await secondInstance!.save(); // has outdated version property
  } catch {
    return;
  }

  throw new Error('Should not reach this point');
});

it('increases the version after update', async () => {
  const ticket = Ticket.build({
    title: 'Ticket1',
    price: 5,
    userId: '123',
  });

  const { version: initialSave } = await ticket.save();
  expect(initialSave).toEqual(0);

  ticket.set({ price: 10 });
  const { version: updateOne } = await ticket.save();
  expect(updateOne).toEqual(1);
  ticket.set({ price: 15 });
  const { version: updateTwo } = await ticket.save();
  expect(updateTwo).toEqual(2);

  expect(updateTwo).toBe(updateOne + 1);
});
