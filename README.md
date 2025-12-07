DeFake – Fake News Detection & Verification System
<img width="1890" height="862" alt="Screenshot 2025-12-06 223306" src="https://github.com/user-attachments/assets/d79d66a1-1c5a-4393-9b00-4afe4f5edb2f" />
<img width="1837" height="853" alt="Screenshot 2025-12-06 224506" src="https://github.com/user-attachments/assets/97743c73-5440-4147-819e-15fdac9f6144" />
<img width="1880" height="827" alt="Screenshot 2025-12-06 224600" src="https://github.com/user-attachments/assets/03d30103-9c55-4854-8482-8348a053b7f2" />
<img width="1852" height="860" alt="Screenshot 2025-12-06 224643" src="https://github.com/user-attachments/assets/b8f5b747-c437-40a5-b413-080b6d89e751" />



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

