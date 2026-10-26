import "dotenv/config";
import { connectDB } from "./db/index.js";

connectDB();

/*
import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import { DB_NAME } from "./constants.js";

// 1. Initialize environment variables immediately
dotenv.config();

const app = express();

// 2. Connect to the database and start the server
(async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    // 2. Handle Express-level errors, app.on('event like mount/error', callback) will Listen for the error event
    app.on("error", (error) => {
      console.error("Error from express:", error);
      throw error;
    });

    // 3. Start listening
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port: ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
})();
*/
