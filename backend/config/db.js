const mongoose = require("mongoose");

let cachedConnection = null;
let connectionPromise = null;

const getMongoUri = () => {
  const mongoURI =
    process.env.NODE_ENV === "test"
      ? process.env.MONGO_URI_TEST
      : process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error(
      process.env.NODE_ENV === "test"
        ? "MONGO_URI_TEST is not defined"
        : "MONGO_URI is not defined"
    );
  }

  return mongoURI;
};

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const mongoURI = getMongoUri();

    if (!connectionPromise) {
      connectionPromise = mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
      });
    }

    cachedConnection = await connectionPromise;
    console.log(`MongoDB connected: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (err) {
    connectionPromise = null;
    console.error("Error connecting to MongoDB:", err.message);

    // Normal Node hosts should stop on database startup failure; Vercel should log it without crashing the function shell.
    if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
      process.exit(1);
    }

    throw err;
  }
};

module.exports = connectDB;
