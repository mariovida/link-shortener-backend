import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import linkRoutes from "./routes/linkRoutes.js";
import * as linkController from "./controllers/linkController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", linkRoutes);

app.get("/:slug", linkController.redirectLink);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
