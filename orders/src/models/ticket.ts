import { OrderStatus } from '@yn-projects/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order } from './order';

// An interface that describes the properties that are required to create a new User
// What we want to have
interface ITicketAttrs {
  id: string;
  title: string;
  price: number;
}

// An interface that describes the properties that a UserModel has
// What mongoose will have
export interface ITicketDocument extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

// An interface that describes the properties that a UserModel has
interface ITicketModel extends mongoose.Model<ITicketDocument> {
  build(attrs: ITicketAttrs): ITicketDocument;
  findByPrevVersion(event: { id: string; version: number }): Promise<ITicketDocument | null>;
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
      versionKey: true,
    },
  }
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
// ticketSchema.pre('save', function (done) {
//   this.$where = {
//     version: this.get('version') - 1,
//   };
//   done();
// });
ticketSchema.statics.build = ({ id, ...rest }: ITicketAttrs) =>
  new Ticket({
    _id: id,
    ...rest,
  });
ticketSchema.statics.findByPrevVersion = ({ id, version }: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: id,
    version: version - 1,
  });
};
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
