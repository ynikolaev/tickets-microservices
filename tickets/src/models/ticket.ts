import mongoose from 'mongoose';

// An interface that describes the properties that are required to create a new User
// What we want to have
interface ITicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// An interface that describes the properties that a UserModel has
// What mongoose will have
interface ITicketDocument extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  userId: string;
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
    userId: {
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
      versionKey: false,
    },
  }
);

ticketSchema.statics.build = (attrs: ITicketAttrs) => new Ticket(attrs);

const Ticket = mongoose.model<ITicketDocument, ITicketModel>('Ticket', ticketSchema);

export { Ticket };
