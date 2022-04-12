import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  console.log('Starting Auth Service.....');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env variable is not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI env variable is not defined');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
  }

  console.log('Connected to MongoDB');

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
