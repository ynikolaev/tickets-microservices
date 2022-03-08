import { NotFoundError, validateRequest } from '@yn-projects/common';
import { param } from 'express-validator';
import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get(
  '/api/tickets/:id',
  [param('id').notEmpty().withMessage('Id parameter is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new NotFoundError();
    }

    res.status(200).send(ticket);
  }
);

export { router as getTicketRouter };
