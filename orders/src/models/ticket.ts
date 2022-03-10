import { OrderStatus } from '@yn-projects/common';
import mongoose from 'mongoose';
import { Order } from './order';

// An interface that describes the properties that are required to create a new User
// What we want to have
interface ITicketAttrs {
  title: string;
  price: number;
}

// An interface that describes the properties that a UserModel has
// What mongoose will have
export interface ITicketDocument extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

// An interface that describes the properties that a UserModel has
interface ITicketModel extends mongoose.Model<ITicketDocument> {
  build(attrs: ITicketAttrs): ITicketDocument;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false,
    },
  }
);

ticketSchema.statics.build = (attrs: ITicketAttrs) => new Ticket(attrs);
ticketSchema.methods.isReserved = async function () {
  // Run query to look at all orders, find an order with the ticket (this),
  // check if its status is not cancelled means the ticket is reserved
  // this == the ticket document
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
    },
  });
  return !!existingOrder;
};

const Ticket = mongoose.model<ITicketDocument, ITicketModel>('Ticket', ticketSchema);

export { Ticket };
