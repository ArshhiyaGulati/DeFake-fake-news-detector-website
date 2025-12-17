from flask import Flask, request, jsonify
from textblob import TextBlob
from dotenv import load_dotenv
import os
import math
from flask_cors import CORS

# ===================================
#  FLASK SETUP
# ===================================
app = Flask(__name__)
CORS(app)

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

# ===================================
#  HEALTH CHECK (CRITICAL FOR RENDER)
# ===================================
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "Flask server running"}), 200

# ===================================
#  DEBUG API KEYS
# ===================================
def verify_api_keys():
    print("\n================= 🔐 API Key Check =================")
    print("✅ GOOGLE_API_KEY loaded." if GOOGLE_API_KEY else "⚠️ GOOGLE_API_KEY missing.")
    print("✅ NEWS_API_KEY loaded." if NEWS_API_KEY else "⚠️ NEWS_API_KEY missing.")
    print("====================================================\n")

verify_api_keys()

# ===================================
#  ANALYSIS FUNCTION
# ===================================
def enhanced_news_analysis(text):
    result = {
        "is_fake": False,
        "confidence": 50,
        "details": [],
        "fake_prob": 50,
        "real_prob": 50
    }

    if len(text.strip()) < 20:
        result["details"].append("Text too short for reliable analysis")
        return result

    text_lower = text.lower()

    try:
        sentiment = TextBlob(text).sentiment
        polarity = sentiment.polarity
        subjectivity = sentiment.subjectivity
    except Exception as e:
        polarity = 0
        subjectivity = 0
        result["details"].append("Sentiment analysis failed safely")

    result["details"].append(
        f"Sentiment polarity={polarity:.2f}, subjectivity={subjectivity:.2f}"
    )

    tone_fake = 0
    tone_real = 0

    if subjectivity > 0.7 and abs(polarity) > 0.5:
        tone_fake = 0.7
        result["details"].append("Highly emotional / biased tone")
    elif subjectivity < 0.4 and abs(polarity) < 0.3:
        tone_real = 0.7
        result["details"].append("Neutral and factual tone")

    sensational = ["shocking", "unbelievable", "miracle", "banned", "alien", "viral"]
    credible = ["report", "study", "research", "official", "analysis"]

    sens_hits = sum(word in text_lower for word in sensational)
    cred_hits = sum(word in text_lower for word in credible)

    if sens_hits:
        tone_fake = max(tone_fake, 0.8)
        result["details"].append(f"Sensational words detected ({sens_hits})")

    if cred_hits:
        tone_real = max(tone_real, 0.8)
        result["details"].append(f"Credible terms found ({cred_hits})")

    exp_fake = math.exp(tone_fake)
    exp_real = math.exp(tone_real)
    total = exp_fake + exp_real

    fake_prob = exp_fake / total
    real_prob = exp_real / total

    result["fake_prob"] = round(fake_prob * 100, 2)
    result["real_prob"] = round(real_prob * 100, 2)
    result["is_fake"] = fake_prob > real_prob

    diff = abs(fake_prob - real_prob)
    result["confidence"] = round(50 + diff * 50, 2)

    return result

# ===================================
#  API ROUTE
# ===================================
@app.route("/api/analyze", methods=["POST"])
def analyze_news():
    try:
        data = request.get_json(force=True)
        text = data.get("text", "").strip()
    except Exception as e:
        return jsonify({"error": "Invalid request format"}), 400

    if not text:
        return jsonify({"error": "Please provide text"}), 400

    try:
        analysis = enhanced_news_analysis(text)
    except Exception as e:
        print("❌ Analysis crash:", e)
        return jsonify({"error": "Analysis failed"}), 500

    return jsonify({
        "prediction": "Fake News" if analysis["is_fake"] else "Real News",
        "confidence": analysis["confidence"],
        "fake_probability": analysis["fake_prob"],
        "real_probability": analysis["real_prob"],
        "details": analysis["details"],
    })

# ===================================
#  RENDER ENTRY POINT
# ===================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
