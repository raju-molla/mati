import mongoose from "mongoose";

/**
 * Cached Mongoose connection. In development (and in warm serverless
 * instances) the module may be evaluated many times, so the connection
 * promise is stored on globalThis to avoid opening a new pool each time.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as unknown as { __mongoose?: Cache };
const cached: Cache = globalForMongoose.__mongoose ?? { conn: null, promise: null };
globalForMongoose.__mongoose = cached;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not set");
    this.name = "DatabaseNotConfiguredError";
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DatabaseNotConfiguredError();

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
