import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import bcrypt from 'bcrypt';
import axios from 'axios'; // ✅ Added axios for Flask bridge

// Setup for __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const saltRounds = 10;

// PostgreSQL connection configuration
// PostgreSQL connection configuration (Render + Local)
let db;

try {
  db = new pg.Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:AYAANARSHHIYA1024@localhost:5432/secrets",
    ssl: process.env.DATABASE_URL
      ? { rejectUnauthorized: false }   // Render
      : false                           // Local (no SSL)
  });

  await db.connect();
  console.log("✅ Database connected:", process.env.DATABASE_URL ? "Render" : "Local");

} catch (err) {
  console.error("❌ Database connection error:", err.message);
  process.exit(1);
}


// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ------------------ SAMPLE DATA ------------------
const fakeNewsSamples = [
  "India and Pakistan Declare Full-Scale War Following Pahalgam Bus Attack",
  "China Diverts Brahmaputra to Relieve Pakistans Water Crisis",
  "U.S. Dollar Collapses Overnight Amidst Trumps 100% Universal Import Tariff",
  "Aliens landed in Paris",
  "Cure for cancer found in potato",
  "Government bans breathing on weekends",
  "Chocolate causes immortality"
];

const realNewsSamples = [
  "hindu tourists attacked in kashmir, 26 fatalities",
  "Militants in Indian Kashmir Separate Men from Women and Children Before Opening Fire in Baisaran Valley",
  "Panic in Pakistan as India Vows to Cut Off Water Supply Over Kashmir",
  "Tariffs to Trigger Sharp US Economic Slowdown, Chance of Recession Jumps to 45%: Reuters Poll",
  "Global warming affects ocean levels",
  "New AI model improves healthcare diagnosis",
  "India launches new satellite successfully",
  "Electric vehicle adoption increases in 2025",
  "UN discusses global peace resolution"
];

// ------------------ ROUTES ------------------
app.get('/', (req, res) => {
  res.render('index', { isAuthenticated: false });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About DeFake', isAuthenticated: false });
});

app.get('/login', (req, res) => {
  res.render('login/home', { title: 'Welcome', error: null });
});

app.get('/login/signin', (req, res) => {
  res.render('login/login', { title: 'Login', error: null });
});

app.get('/login/register', (req, res) => {
  res.render('login/register', { title: 'Register', error: null });
});

// ------------------ LOGIN ------------------
app.post('/login/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        res.render('login/success', {
          title: 'Success',
          message: 'Login successful!',
          user,
        });
      } else {
        res.render('login/login', { title: 'Login', error: 'Invalid credentials' });
      }
    } else {
      res.render('login/login', { title: 'Login', error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.render('login/login', { title: 'Login', error: 'Database error' });
  }
});

// ------------------ REGISTER ------------------
app.post('/login/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const check = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0)
      return res.render('login/register', { title: 'Register', error: 'Email already exists' });

    const hash = await bcrypt.hash(password, saltRounds);
    const result = await db.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, hash]);

    res.render('login/success', { title: 'Success', message: 'Registration successful!', user: result.rows[0] });
  } catch (err) {
    console.error('Registration error:', err);
    res.render('login/register', { title: 'Register', error: 'Registration failed' });
  }
});

// ------------------ LOCAL NEWS CHECK ------------------
app.post('/check-news', (req, res) => {
  const input = req.body.newsInput?.trim().toLowerCase();

  if (!input) {
    return res.json({
      message: "Please enter a news article or URL.",
      color: "#DC2626",
      score: null,
      factors: []
    });
  }

  const fakeNewsLower = fakeNewsSamples.map(n => n.toLowerCase());
  const realNewsLower = realNewsSamples.map(n => n.toLowerCase());

  if (fakeNewsLower.includes(input)) {
    return res.json({
      message: "⚠️ This news appears to be FAKE.",
      color: "#DC2626",
      score: 20,
      factors: ["Contains sensational claims", "Emotional tone", "No evidence"]
    });
  } else if (realNewsLower.includes(input)) {
    return res.json({
      message: "✅ This news appears to be REAL.",
      color: "#059669",
      score: 85,
      factors: ["Credible sources", "Factual consistency", "Neutral language"]
    });
  }

  return res.json({
    message: "🤔 Unable to determine authenticity. Try another headline.",
    color: "#6B7280",
    score: 50,
    factors: ["Not enough data", "Check multiple sources"]
  });
});

// ------------------ FLASK FACTCHECK ROUTE ------------------
// --- AUTO WAKE-UP RETRY FUNCTION FOR FLASK ---
async function callFlaskWithRetries(url, payload, retries = 6, delay = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔁 Attempt ${attempt} → Calling Flask...`);
      const response = await axios.post(url, payload);
      console.log("✅ Flask responded successfully");
      return response;
    } catch (err) {
      console.log(
        `⚠️ Flask not ready (maybe sleeping). Retrying in ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error("Flask unavailable after retries");
}

// --- FLASK URL (PROD OR LOCAL) ---
// Correct Flask URL for Render deployment
const flaskUrl =
  process.env.NODE_ENV === "production"
    ? "https://defake-fake-news-detector-website.onrender.com/api/analyze"
    : "http://localhost:5000/api/analyze";

// Retry wrapper (wait for Flask to wake)
async function callFlaskWithRetry(text, retries = 8) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔁 Attempt ${i + 1} → calling Flask...`);
      const response = await axios.post(flaskUrl, { text });
      return response.data;
    } catch (err) {
      console.log("❌ Flask not awake yet:", err.message);
      await new Promise((res) => setTimeout(res, 2000)); // wait 2 sec
    }
  }
  throw new Error("Flask did not wake up in time");
}

app.post("/factcheck", async (req, res) => {
  const text = req.body.text || req.body.newsInput;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const data = await callFlaskWithRetry(text);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Flask failed to wake up",
      details: err.message,
    });
  }
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Node server running on port ${PORT}`);
});
