import { nanoid } from "nanoid";
import { pool } from "../db.js";
import bcrypt from "bcrypt";

export const createLink = async (url, customSlug, password, expiresAt) => {
  if (!url) throw { status: 400, message: "URL is required" };

  let slug = customSlug?.trim() || nanoid(6).toLowerCase();
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const [rows] = await pool.query("SELECT slug FROM links WHERE slug = ?", [
    slug,
  ]);
  if (rows.length > 0) throw { status: 400, message: "Slug already in use." };

  await pool.query(
    "INSERT INTO links (slug, url, clicks, created_at, expires_at, password_hash) VALUES (?, ?, 0, NOW(), ?, ?)",
    [slug, url, expiresAt || null, passwordHash]
  );

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  return `${baseUrl}/${slug}`;
};

export const getLinkStats = async (slug) => {
  const [rows] = await pool.query(
    "SELECT slug, url, clicks, created_at FROM links WHERE slug = ?",
    [slug]
  );
  if (rows.length === 0) throw { status: 404, message: "Link not found." };

  return rows[0];
};

export const trackClick = async (slug) => {
  const [rows] = await pool.query(
    "SELECT url, password_hash, expires_at FROM links WHERE slug = ?",
    [slug]
  );

  if (rows.length === 0) throw { status: 404, message: "Not found" };

  const link = rows[0];

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    throw { status: 410, message: "This link has expired." };
  }

  await pool.query("UPDATE links SET clicks = clicks + 1 WHERE slug = ?", [
    slug,
  ]);
};

export const getLinkUrl = async (slug) => {
  const [rows] = await pool.query("SELECT url FROM links WHERE slug = ?", [
    slug,
  ]);
  if (rows.length === 0) throw { status: 404, message: "Not found" };

  return rows[0].url;
};

export const deleteLink = async (slug) => {
  const [result] = await pool.query("DELETE FROM links WHERE slug = ?", [slug]);
  if (result.affectedRows === 0)
    throw { status: 404, message: "Link not found." };
};
