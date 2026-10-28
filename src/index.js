import "dotenv/config"; // 1. TURN ON THE POWER IMMEDIATELY
import { app } from "./app.js"; // 2. Now app.js can securely read environment variables
import { connectDB } from "./db/index.js"; // 3. Database connection can read MONGODB_URI safely

connectDB()
  .then(() => {
    // Listen for internal Express connection errors
    app.on("error", (error) => {
      console.error("Express startup failure:", error);
      process.exit(1);
    });

    // Fire up the server
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo Db Connection Failed !!!", err);
  });

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
