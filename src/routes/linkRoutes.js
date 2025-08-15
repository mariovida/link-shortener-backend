import express from "express";
import {
  createShortLink,
  redirectLink,
  getLinkStats,
  deleteLink,
} from "../controllers/linkController.js";

const router = express.Router();

router.post("/shorten", createShortLink);
router.get("/:slug", redirectLink);
router.get("/stats/:slug", getLinkStats);
router.delete("/links/:slug", deleteLink);

export default router;
