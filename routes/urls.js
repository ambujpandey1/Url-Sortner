// routes/urls.js

const express = require("express");
const router = express.Router();
const { customAlphabet } = require("nanoid");
const Url = require("../models/url");

// --- Helper function to validate a URL ---
const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
};

// --- API Endpoint to Shorten a URL ---
// POST /api/v1/shorten
router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  // 1. Validate the long URL
  if (!isValidUrl(longUrl)) {
    return res.status(400).json({ error: "Invalid URL provided." });
  }

  try {
    // 2. Check if the long URL already exists in the database
    let urlEntry = await Url.findOne({ longUrl });

    if (urlEntry) {
      // If it exists, return the existing short URL
      res.status(200).json({ shortUrl: `${baseUrl}/${urlEntry.shortUrl}` });
    } else {
      // 3. If it doesn't exist, create a new short URL
      // Using nanoid to generate a unique 7-character string
      const nanoid = customAlphabet(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        7
      );
      const shortUrlId = nanoid();

      // 4. Create a new URL document and save it to the database
      urlEntry = new Url({
        longUrl,
        shortUrl: shortUrlId,
      });

      await urlEntry.save();

      // 5. Return the newly created short URL
      res.status(201).json({ shortUrl: `${baseUrl}/${urlEntry.shortUrl}` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

module.exports = router;
