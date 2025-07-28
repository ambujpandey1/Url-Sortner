// public/script.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shorten-form");
  const longUrlInput = document.getElementById("long-url-input");
  const resultContainer = document.getElementById("result-container");
  const shortUrlLink = document.getElementById("short-url-link");
  const copyBtn = document.getElementById("copy-btn");
  const copyFeedback = document.getElementById("copy-feedback");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const longUrl = longUrlInput.value;

    // Hide previous results and errors
    resultContainer.classList.add("hidden");
    errorMessage.classList.add("hidden");

    try {
      const response = await fetch("/api/v1/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ longUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        // Display the result
        shortUrlLink.href = data.shortUrl;
        shortUrlLink.textContent = data.shortUrl;
        resultContainer.classList.remove("hidden");
      } else {
        // Display an error message
        errorMessage.textContent = data.error || "An unknown error occurred.";
        errorMessage.classList.remove("hidden");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      errorMessage.textContent =
        "Could not connect to the server. Please check your connection.";
      errorMessage.classList.remove("hidden");
    }
  });

  copyBtn.addEventListener("click", () => {
    // Use the Clipboard API to copy the text
    navigator.clipboard
      .writeText(shortUrlLink.href)
      .then(() => {
        // Show feedback message
        copyFeedback.classList.add("visible");
        setTimeout(() => {
          copyFeedback.classList.remove("visible");
        }, 2000); // Hide after 2 seconds
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        // Fallback for older browsers could be implemented here
      });
  });
});
