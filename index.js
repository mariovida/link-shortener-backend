import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import { pool } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Create short URL
app.post("/api/shorten", async (req, res) => {
  const { url, customSlug, expiresAt } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  let slug = customSlug?.trim() || nanoid(6).toLowerCase();

  try {
    const [rows] = await pool.query("SELECT slug FROM links WHERE slug = ?", [
      slug,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "Slug already in use." });
    }

    await pool.query(
      "INSERT INTO links (slug, url, clicks, created_at, expires_at) VALUES (?, ?, 0, NOW(), ?)",
      [slug, url, expiresAt || null]
    );

    res.json({ shortUrl: `http://localhost:${PORT}/${slug}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Redirect route
app.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT url, clicks, expires_at FROM links WHERE slug = ?",
      [slug]
    );

    if (rows.length === 0) return res.status(404).send("Not found");

    if (rows[0].expires_at && new Date(rows[0].expires_at) < new Date()) {
      return res.status(410).send("This link has expired");
    }

    const url = rows[0].url;
    const clicks = rows[0].clicks;

    pool.query("UPDATE links SET clicks = ? WHERE slug = ?", [
      clicks + 1,
      slug,
    ]);

    res.redirect(url);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Get link stats
app.get("/api/stats/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT slug, url, clicks, created_at FROM links WHERE slug = ?",
      [slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Link not found." });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete link by slug
app.delete("/api/links/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM links WHERE slug = ?", [
      slug,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Link not found." });
    }
    res.json({ message: "Link deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
