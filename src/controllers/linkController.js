import * as linkService from "../services/linkService.js";

// Create short URL
export const createShortLink = async (req, res) => {
  const { url, customSlug, password, expiresAt } = req.body;
  try {
    const shortUrl = await linkService.createLink(
      url,
      customSlug,
      password,
      expiresAt
    );
    res.json({ shortUrl });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

// Redirect to original URL
export const redirectLink = async (req, res) => {
  const { slug } = req.params;
  try {
    await linkService.trackClick(slug);
    res.redirect(await linkService.getLinkUrl(slug));
  } catch (error) {
    res.status(error.status || 500).send(error.message);
  }
};

// Get link stats
export const getLinkStats = async (req, res) => {
  const { slug } = req.params;
  try {
    const stats = await linkService.getLinkStats(slug);
    res.json(stats);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

// Delete link
export const deleteLink = async (req, res) => {
  const { slug } = req.params;
  try {
    await linkService.deleteLink(slug);
    res.json({ message: "Link deleted successfully." });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};
