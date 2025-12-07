DeFake – Fake News Detection & Verification System

DeFake is a full-stack web application designed to help users verify the authenticity of news articles, headlines, and claims.
It uses a hybrid analysis engine combining:

🔹 Linguistic analysis

🔹 Sentiment scoring

🔹 Keyword-based credibility heuristics

🔹 Real-time backend processing via Flask

🔹 A modern UI powered by Node.js & EJS

DeFake allows users to paste a news article/claim and get a credibility score, probability breakdown, and explanation factors.

🚀 Live Features
✔ AI-Inspired Fake News Detection

Evaluates text using sentiment signals, sensational keywords, and credibility patterns.

✔ Dual Backend

Node.js serves frontend pages and routes.

Python Flask API analyzes the news and returns classification results.

✔ Beautiful UI + Real-Time Response

The frontend includes:

A verification panel

Confidence gauges

Explanation factors

Animated results

✔ User System

Login & registration (PostgreSQL)

Password hashing (bcrypt)

✔ Responsive homepage with hero section, trending cards, and highlights
🧰 Tech Stack
Frontend

HTML, CSS, JavaScript

EJS Templates

Service Worker support

Backend
Node.js Server

Express.js

PostgreSQL (pg)

Axios (Flask bridge)

Python Flask API

Flask

TextBlob

Flask-CORS

dotenv

