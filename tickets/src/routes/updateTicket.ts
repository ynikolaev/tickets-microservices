import { NotAuthorisedError, NotFoundError, requireAuth, validateRequest } from '@yn-projects/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser?.id) {
      throw new NotAuthorisedError();
    }

    const { title, price } = req.body;
    ticket.set({
      title,
      price,
    });

    await ticket.save();

    res.status(200).send(ticket);
  }
);

export { router as updateTicketRouter };
