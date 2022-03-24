import { OrderStatus } from '@yn-projects/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { ITicketDocument } from './ticket';

// An interface that describes the properties that are required to create a new User
// What we want to have
interface IOrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicketDocument;
}

// An interface that describes the properties that a UserModel has
// What mongoose will have
export interface IOrderDocument extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  version: number;
  ticket: ITicketDocument;
}

// An interface that describes the properties that a UserModel has
interface IOrderModel extends mongoose.Model<IOrderDocument> {
  build(attrs: IOrderAttrs): IOrderDocument;
}

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
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

OrderSchema.set('versionKey', 'version');
OrderSchema.plugin(updateIfCurrentPlugin);
OrderSchema.statics.build = (attrs: IOrderAttrs) => new Order(attrs);

const Order = mongoose.model<IOrderDocument, IOrderModel>('Order', OrderSchema);

export { Order };
