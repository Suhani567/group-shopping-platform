import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('MONGODB_URI is empty: using in-memory demo storage.');
    return false;
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  return true;
}
