import express from "express";
import dotenv from "dotenv";
dotenv.config();
import authRouter from "./routes/auth.js";
import serviceRouter from "./routes/service.js";
import resaRouter from "./routes/reservations.js";
import dogRouter from "./routes/dogs.js";
import userRouter from "./routes/user.js";
import cors from "cors";

import { mongoDb } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use(cors());

mongoDb();

app.use("/api/auth", authRouter);
app.use("/api/service", serviceRouter);
app.use("/api/reservations", resaRouter);
app.use("/api/dogs", dogRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  console.log("Server is running on port :" + PORT);
});
