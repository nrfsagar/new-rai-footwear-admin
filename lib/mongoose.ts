import mongoose, { Mongoose } from 'mongoose';

// Ensure that the MONGODB_URL is present.
const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  throw new Error('Missing MONGODB_URL');
}

// Define the interface for the Mongoose connection object.
interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Retrieve or initialize the cached connection object.
// let cached: MongooseConnection = (global as any).mongoose;
let cached: MongooseConnection = (global as unknown as { mongoose: MongooseConnection }).mongoose;

if (!cached) {
  // cached = (global as any).mongoose = { conn: null, promise: null };
  cached = (global as unknown as { mongoose: MongooseConnection }).mongoose = { conn: null, promise: null };
}

// Function to connect to the database.
export const connectToDatabase = async () => {
  // Return the existing connection if it's already established.
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no promise of a connection, create a new connection promise.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: 'new-rai-footwear',
      bufferCommands: false, // Disable buffering of commands.
    });
  }

  // Await the connection promise and cache the resolved connection.
  cached.conn = await cached.promise;

  // Return the established connection.
  return cached.conn;
};