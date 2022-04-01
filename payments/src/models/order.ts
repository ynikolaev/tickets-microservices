import { OrderStatus } from '@yn-projects/common';
import mongoose from 'mongoose';

import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// An interface that describes the properties that are required to create a new Order
// What we want to have
interface IOrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// An interface that describes the properties that a OrderModel has
// What mongoose will have
interface IOrderDocument extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// An interface that describes the properties that a UserModel has
interface IOrderModel extends mongoose.Model<IOrderDocument> {
  build(attrs: IOrderAttrs): IOrderDocument;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
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

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);
orderSchema.statics.build = (attrs: IOrderAttrs) => new Order({ _id: attrs.id, ...attrs });

const Order = mongoose.model<IOrderDocument, IOrderModel>('Order', orderSchema);

export { Order };
