import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

// 1. Cross-Origin Resource Sharing (Allows your frontend to talk to your backend)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// 2. Body Parsers (Handles incoming data payloads)
app.use(express.json({ limit: "16kb" })); // for parsing application/json and Limits JSON payload size to prevent DDoS attacks
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // for parsing application/x-www-form-urlencoded

// 3. Static Files (Serves assets like images/PDFs from the public folder)
app.use(express.static("public"));

// 4. Cookie Parser (Allows server to read and set secure cookies in the user's browser)
app.use(cookieParser());

// User Router Import
import userRouter from "./routes/user.routes.js";

// User Router Declaration
app.use("/api/v1/users", userRouter);

export { app };
