import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "https://www.aiserbisyosstudio.com",
      "https://aiserbisyosstudio.com",
      "http://localhost:5173",
      "http://192.168.1.2:5173",
      "http://172.20.10.6:5173"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import contactRouter from "./routes/contact.route.js";
import planRouter from "./routes/plan.route.js";
import orderRouter from "./routes/order.route.js";
import otpRouter from "./routes/otp.route.js";
import serbisyosRouter from "./routes/serbisyos-ai.route.js";
import statsRouter from "./routes/statistics.route.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/plan", planRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/otp", otpRouter);
app.use("/api/v1/serbisyos", serbisyosRouter);
app.use("/api/v1/statistics", statsRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to AI Serbisyos Studio api service...",
  });
});

app.get("/error", (req, res) => {
  try {
    throw new Error("Sample Error");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default app;