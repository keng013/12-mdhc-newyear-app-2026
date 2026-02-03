import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import participantsRoutes from "./routes/participants";
import adminRoutes from "./routes/admin";
import prizesRoutes from "./routes/prizes";
import luckyDrawRoutes from "./routes/luckyDraw";
import dashboardRoutes from "./routes/dashboard";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/participants", participantsRoutes);
app.use("/api/admin/prizes", prizesRoutes);
app.use("/api/auth", adminRoutes);
app.use("/api/admin/lucky-draw", luckyDrawRoutes);
app.use("/api/dashboard", dashboardRoutes);


// health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

export default app;
