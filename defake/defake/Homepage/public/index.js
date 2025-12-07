// ✅ Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("ServiceWorker registered:", registration.scope);
      })
      .catch((error) => {
        console.error("ServiceWorker registration failed:", error);
      });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Script initialized");

  const checkButton = document.getElementById("checkButton");
  const clearButton = document.getElementById("clearButton");
  const newsInput = document.getElementById("newsInput");
  const verdictMessage = document.getElementById("verdictMessage");
  const credibilityScore = document.getElementById("credibilityScore");
  const loader = document.getElementById("loader") || { style: { display: "none" } };

  // ⚠️ FIX: Close the bracket properly
  if (!clearButton) {
    console.warn("⚠️ clearButton not found — using safe dummy element.");
  }

  if (!checkButton || !newsInput || !verdictMessage || !credibilityScore) {
    console.error("❌ Required elements not found!");
    return;
  }

  // SAFE Loading Handler
  function setLoading(state) {
    if (loader && loader.style) loader.style.display = state ? "block" : "none";
    if (checkButton) checkButton.disabled = state;
    if (clearButton) clearButton.disabled = state;
  }

  // 🧠 UI Renderer
  function updateCredibilityScore(score, fakeProb, realProb, explanation, details) {
    if (!score) {
      credibilityScore.innerHTML = "";
      return;
    }

    const scoreHtml = `
      <div class="result-card fade-in">
        <div class="score-circle">${score}%</div>
        <div class="result-info">
          <h3>Confidence Level</h3>
          <p>${explanation || "Analysis based on AI, sentiment, and fact-checking."}</p>
        </div>
      </div>

      <div class="score-breakdown fade-in">
        <h4>Probability Breakdown:</h4>
        <ul>
          <li>🟥 Fake Probability: <strong>${fakeProb}%</strong></li>
          <li>🟩 Real Probability: <strong>${realProb}%</strong></li>
        </ul>
      </div>

      <div class="details-section fade-in">
        <h4>Key Analysis Factors:</h4>
        <ul>${details.map((d) => `<li>${d}</li>`).join("")}</ul>
      </div>
    `;

    credibilityScore.innerHTML = scoreHtml;
  }

  // 🧩 Main CHECK Button Logic
  checkButton.addEventListener("click", async function (e) {
    e.preventDefault();
    const input = newsInput.value.trim();

    if (!input) {
      verdictMessage.textContent = "Please enter some text to check.";
      verdictMessage.style.color = "#DC2626";
      updateCredibilityScore(null, 0, 0, "");
      return;
    }

    setLoading(true);
    verdictMessage.textContent = "Analyzing...";
    verdictMessage.style.color = "#6B7280";
    credibilityScore.innerHTML = "";

    try {
      console.log("➡️ Sending request to /factcheck");

      const response = await fetch("/factcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("✅ Flask response:", data);

      verdictMessage.textContent = data.prediction;
      verdictMessage.style.color =
        data.prediction === "Fake News" ? "#DC2626" : "#059669";

      updateCredibilityScore(
        data.confidence,
        data.fake_probability,
        data.real_probability,
        "Based on linguistic + sentiment analysis.",
        data.details || []
      );
    } catch (error) {
      console.error("❌ Error:", error);
      verdictMessage.textContent = "Error checking news. Please try again.";
      verdictMessage.style.color = "#DC2626";
      updateCredibilityScore(null, 0, 0, "");
    } finally {
      setLoading(false);
    }
  });

  // 🧹 Clear Button
  if (clearButton) {
    clearButton.addEventListener("click", function () {
      newsInput.value = "";
      verdictMessage.textContent = "";
      credibilityScore.innerHTML = "";
    });
  }
});
