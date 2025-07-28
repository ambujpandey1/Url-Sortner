// server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Url = require("./models/url");

// Load environment variables from .env file
dotenv.config();

const app = express();

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI);
// ,
// {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// --- Middleware ---
// To parse JSON bodies
app.use(express.json());
// To serve static files like index.html, styles.css
app.use(express.static(path.join(__dirname, "public")));

// --- Routes ---
const urlRoutes = require("./routes/urls");
app.use("/api/v1", urlRoutes);

// --- Redirect Logic ---
app.get("/:shortUrl", async (req, res) => {
  try {
    const urlEntry = await Url.findOne({ shortUrl: req.params.shortUrl });

    if (urlEntry) {
      // It's good practice to not log every single redirect in production
      // for performance reasons, but we log it here for demonstration.
      console.log(`Redirecting ${req.params.shortUrl} to ${urlEntry.longUrl}`);

      // Note: In a production analytics system, you would update the click
      // count asynchronously, perhaps using a message queue.
      urlEntry.clickCount++;
      await urlEntry.save();

      return res.redirect(urlEntry.longUrl);
    } else {
      // If the short URL is not found, send a 404 Not Found response
      return res
        .status(404)
        .sendFile(path.join(__dirname, "public", "404.html"));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

// --- Server Initialization ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
