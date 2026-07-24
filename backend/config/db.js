const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error(
        process.env.NODE_ENV === "test"
          ? "MONGO_URI_TEST is not defined in .env"
          : "MONGO_URI is not defined in .env"
      );
    }

    const connection = await mongoose.connect(mongoURI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
