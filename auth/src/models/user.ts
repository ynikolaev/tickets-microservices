import mongoose from 'mongoose';
import { Password } from '../services/password';

// An interface that describes the properties that are required to create a new User
// What we want to have
interface IUserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a UserModel has
interface IUserModel extends mongoose.Model<IUserDocument> {
  build(attrs: IUserAttrs): IUserDocument;
}

// An interface that describes the properties that a UserModel has
// What mongoose will have
interface IUserDocument extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
      versionKey: false,
    },
  }
);

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: IUserAttrs) => new User(attrs);

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export { User };
