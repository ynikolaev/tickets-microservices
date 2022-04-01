import mongoose from 'mongoose';

// An interface that describes the properties that are required to create a new Payments
// What we want to have
interface IPaymentsAttrs {
  stripeId: string;
  orderId: string;
}

// An interface that describes the properties that a PaymentsModel has
// What mongoose will have
interface IPaymentsDocument extends mongoose.Document {
  stripeId: string;
  orderId: string;
}

// An interface that describes the properties that a UserModel has
interface IPaymentsModel extends mongoose.Model<IPaymentsDocument> {
  build(attrs: IPaymentsAttrs): IPaymentsDocument;
}

const PaymentsSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
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

PaymentsSchema.statics.build = (attrs: IPaymentsAttrs) => new Payments(attrs);

const Payments = mongoose.model<IPaymentsDocument, IPaymentsModel>('Payments', PaymentsSchema);

export { Payments };
