# MindPath — AI-Powered HR Analytics Platform

> A full-stack AI/ML-powered HR analytics platform built using React, Django REST Framework, scikit-learn, HuggingFace Transformers, and Google Gemini.

---

# 🚀 Overview

MindPath is an intelligent HR analytics system designed to help organizations proactively monitor employee wellbeing, predict attrition risk, and automate performance evaluation workflows using AI and machine learning.

The platform combines:

- Machine Learning for attrition prediction
- NLP sentiment analysis for burnout detection
- Generative AI for automated performance reviews
- Interactive dashboards for workforce analytics

Built as a production-style portfolio project demonstrating end-to-end AI integration in a modern full-stack application.

---

# ✨ Features

## 📊 HR Analytics Dashboard

- Workforce overview
- Department-wise employee distribution
- Attrition risk visualization
- Burnout analytics
- Performance metrics
- Interactive charts and graphs

---

## 👥 Employee Management

- Employee directory
- Search and filter employees
- Detailed employee profiles
- Attendance and performance tracking
- Satisfaction score visualization

---

## ⚠️ Attrition Prediction Engine

Predicts employee flight risk using machine learning.

### AI/ML Used

- RandomForestClassifier
- scikit-learn
- Feature engineering + risk scoring

### Output

- Risk percentage
- Risk category:
  - Low
  - Medium
  - High
  - Critical
- Top contributing factor

---

## 🧠 Burnout Detection System

Analyzes employee self-assessment text using NLP sentiment analysis.

### NLP Model

- HuggingFace Transformers
- distilbert-base-uncased-finetuned-sst-2-english

### Features

- Weekly assessments
- Sentiment scoring
- Burnout categorization
- Active burnout alerts
- Burnout distribution analytics

---

## ✍️ AI Performance Review Generator

Automatically generates professional employee performance reviews using Generative AI.

### AI Used

- Google Gemini API
- Intelligent fallback generation system

### Features

- AI-generated reviews
- Editable review drafts
- Review history
- Quarterly review support

---

# 🏗️ Tech Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart.js

## Backend

- Django 4
- Django REST Framework
- Session Authentication
- Django ORM

## Database

- PostgreSQL / SQLite

## AI / ML

- scikit-learn
- HuggingFace Transformers
- Google Gemini API

---

# 🧠 System Architecture

```text
React Frontend
       ↓
Axios API Layer
       ↓
Django REST API
       ↓
AI / ML Engine
 ├── Random Forest Model
 ├── DistilBERT NLP Pipeline
 └── Gemini Review Generator
       ↓
PostgreSQL Database
```

---

# 📂 Project Structure

```text
mindpath/
│
├── backend/
│   ├── analytics/
│   ├── ai_engine/
│   ├── employees/
│   ├── users/
│   ├── ml_models/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Shivang-Mishra-20/MindPath.git
cd MindPath
```

---

# 🔧 Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create `.env`

```env
SECRET_KEY=your_secret_key
DEBUG=True

GEMINI_API_KEY=your_gemini_api_key
```

Run migrations:

```bash
python manage.py migrate
```

Seed sample data:

```bash
python manage.py seed_data
```

Start backend server:

```bash
python manage.py runserver
```

Backend runs on:

```text
http://localhost:8000
```

---

# 🎨 Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🤖 Train ML Model

Train attrition prediction model:

```bash
python manage.py train_model
```

This:
- Generates synthetic HR training data
- Trains RandomForest model
- Saves trained model files

---

# 🔐 Authentication

The project uses:

- Django Session Authentication
- CSRF Protection
- Secure cookie-based login system

---

# 📈 AI Modules

| Module | Technology |
|---|---|
| Attrition Prediction | Random Forest |
| Burnout Analysis | DistilBERT |
| Performance Reviews | Gemini API |
| Dashboard Analytics | Chart.js |

---

# 📸 Application Screens

- Login Page
- Analytics Dashboard
- Employee Directory
- Employee Profile
- Attrition Risk Center
- Burnout Monitor
- AI Performance Reviews

---

# 🛡️ Fallback Systems

The application includes intelligent fallback systems:

- If ML model is unavailable → heuristic scoring is used
- If HuggingFace pipeline fails → keyword sentiment analysis is used
- If Gemini API fails → template-based review generation is used

This ensures the platform remains functional even during external API/model failures.

---

# 🎯 Key Highlights

- Full-stack AI application
- Real NLP integration
- Machine learning prediction pipeline
- Production-style architecture
- Interactive analytics dashboards
- Modular backend architecture
- Session-based authentication
- Responsive UI

---

# 📌 Future Improvements

- Role-based access control
- Real-time notifications
- AI chatbot assistant
- Multi-tenant architecture
- Docker deployment

---
