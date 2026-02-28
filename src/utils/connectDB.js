"use server";

import mongoose from "mongoose";
import { ERROR_CODES } from "@/errors/codes";
import { ERROR_MESSAGES } from "@/errors/messages";

const DATABASE_URL = process.env.MONGODB_URI || "";

if (!DATABASE_URL) {
  throw new Error(ERROR_MESSAGES[ERROR_CODES.CONFIG_MISSING_MONGODB_URI]);
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(DATABASE_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
