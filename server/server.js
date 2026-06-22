import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import authRouter from "./routes/auth.js";
import serviceRouter from "./routes/service.js";
import dogRouter from "./routes/dogs.js";
import contactRouter from "./routes/contact.js";
import userRouter from "./routes/user.js";
import adminRouter from "./routes/admin.js";
import availabilityRouter from "./routes/availability.js";
import { mongoDb } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://lgardeduc.vercel.app"],
  }),
);

mongoDb();

app.use("/api/auth", authRouter);
app.use("/api/service", serviceRouter);
app.use("/api/dogs", dogRouter);
app.use("/api/user", userRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRouter);
app.use("/api/availability", availabilityRouter);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log("Server is running on port :" + PORT);
});
