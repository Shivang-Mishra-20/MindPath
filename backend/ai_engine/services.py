"""
AI Engine Services
Core AI/ML logic: attrition prediction, burnout NLP analysis, Gemini review generation.
"""

import os
import logging
import numpy as np
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)

# ─── Attrition Model ─────────────────────────────────────────────────────────

_attrition_model = None
_attrition_scaler = None


def _load_attrition_model():
    """Load the trained attrition model and scaler (lazy loading)."""
    global _attrition_model, _attrition_scaler
    if _attrition_model is not None:
        return _attrition_model, _attrition_scaler

    import joblib
    model_path = settings.ML_MODEL_PATH / 'attrition_model.joblib'
    scaler_path = settings.ML_MODEL_PATH / 'attrition_scaler.joblib'

    if not model_path.exists():
        logger.warning("Attrition model not found. Run train_model management command.")
        return None, None

    try:
        _attrition_model = joblib.load(model_path)
        _attrition_scaler = joblib.load(scaler_path) if scaler_path.exists() else None
        logger.info("Attrition model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load attrition model: {e}")
        return None, None

    return _attrition_model, _attrition_scaler


def _employee_to_features(employee) -> np.ndarray:
    """
    Convert an Employee model instance to the feature vector expected by the ML model.
    Based on IBM HR Analytics dataset columns.
    """
    # Binary encode categorical features
    overtime = 1 if employee.overtime else 0
    business_travel_rarely = 1 if employee.business_travel == 'Travel_Rarely' else 0
    business_travel_frequently = 1 if employee.business_travel == 'Travel_Frequently' else 0
    gender_male = 1 if employee.gender == 'M' else 0
    marital_married = 1 if employee.marital_status == 'Married' else 0
    marital_single = 1 if employee.marital_status == 'Single' else 0

    features = np.array([[
        employee.age,
        business_travel_rarely,
        business_travel_frequently,
        employee.distance_from_home,
        employee.education,
        employee.environment_satisfaction,
        gender_male,
        employee.job_level,
        employee.job_satisfaction,
        employee.monthly_income,
        employee.num_companies_worked,
        overtime,
        employee.percent_salary_hike,
        employee.performance_rating,
        employee.relationship_satisfaction,
        employee.total_working_years,
        employee.training_times_last_year,
        employee.work_life_balance,
        employee.years_at_company,
        employee.years_in_current_role,
        employee.years_since_last_promotion,
        employee.years_with_curr_manager,
        marital_married,
        marital_single,
    ]])
    return features


# Feature names for explainability
FEATURE_NAMES = [
    'Age', 'Business Travel (Rarely)', 'Business Travel (Frequently)',
    'Distance From Home', 'Education', 'Environment Satisfaction',
    'Gender (Male)', 'Job Level', 'Job Satisfaction', 'Monthly Income',
    'Num Companies Worked', 'Overtime', 'Percent Salary Hike',
    'Performance Rating', 'Relationship Satisfaction', 'Total Working Years',
    'Training Times Last Year', 'Work Life Balance', 'Years At Company',
    'Years In Current Role', 'Years Since Last Promotion',
    'Years With Current Manager', 'Marital Status (Married)',
    'Marital Status (Single)'
]


def predict_attrition(employee) -> dict:
    """
    Predict attrition risk for a given employee.
    Returns { risk_score, top_factors } dict.
    Falls back to a heuristic model if ML model is unavailable.
    """
    model, scaler = _load_attrition_model()

    features = _employee_to_features(employee)

    if model is not None:
        # Use trained ML model
        if scaler is not None:
            features_scaled = scaler.transform(features)
        else:
            features_scaled = features

        risk_score = float(model.predict_proba(features_scaled)[0][1])

    # Generate employee-specific top risk factors
    top_factors = []

    if employee.overtime:
        top_factors.append({
            'feature': 'OverTime',
            'importance': 0.28
        })

    if employee.job_satisfaction <= 2:
        top_factors.append({
            'feature': 'Job Satisfaction',
            'importance': 0.20
        })

    if employee.work_life_balance <= 2:
        top_factors.append({
            'feature': 'Work-Life Balance',
            'importance': 0.18
        })

    if employee.years_since_last_promotion >= 4:
        top_factors.append({
            'feature': 'Years Since Last Promotion',
            'importance': 0.14
        })

    if employee.distance_from_home > 20:
        top_factors.append({
            'feature': 'Distance From Home',
            'importance': 0.10
        })

    if employee.monthly_income < 40000:
        top_factors.append({
            'feature': 'Monthly Income',
            'importance': 0.12
        })

    if employee.environment_satisfaction <= 2:
        top_factors.append({
            'feature': 'Environment Satisfaction',
            'importance': 0.16
        })

    if employee.relationship_satisfaction <= 2:
        top_factors.append({
            'feature': 'Relationship Satisfaction',
            'importance': 0.10
        })

    # Fallback if no major factors triggered
    if not top_factors:
        top_factors.append({
            'feature': 'General Workforce Trends',
            'importance': 0.05
        })

        # Sort descending
        top_factors = sorted(
            top_factors,
            key=lambda x: x['importance'],
            reverse=True
        )[:5]
    else:
        # Heuristic fallback when model is not trained yet
        risk_score = _heuristic_attrition_score(employee)
        top_factors = _heuristic_top_factors(employee)

    return {
        'risk_score': round(risk_score, 4),
        'top_factors': top_factors
    }


def _heuristic_attrition_score(employee) -> float:
    """
    Simple rule-based attrition score as fallback.
    Based on known IBM HR attrition correlations.
    """
    score = 0.15  # base rate ~15%

    if employee.overtime:
        score += 0.12
    if employee.job_satisfaction <= 2:
        score += 0.10
    if employee.work_life_balance <= 2:
        score += 0.08
    if employee.years_since_last_promotion >= 4:
        score += 0.07
    if employee.environment_satisfaction <= 2:
        score += 0.07
    if employee.distance_from_home > 20:
        score += 0.05
    if employee.num_companies_worked > 5:
        score += 0.05
    if employee.relationship_satisfaction <= 2:
        score += 0.05
    if employee.monthly_income < 30000:
        score += 0.08
    if employee.years_at_company <= 2:
        score += 0.06

    return min(score, 0.99)


def _heuristic_top_factors(employee) -> list:
    """Return human-readable top risk factors based on employee data."""
    factors = []

    if employee.overtime:
        factors.append({'feature': 'Overtime', 'importance': 0.12})
    if employee.job_satisfaction <= 2:
        factors.append({'feature': 'Low Job Satisfaction', 'importance': 0.10})
    if employee.work_life_balance <= 2:
        factors.append({'feature': 'Poor Work-Life Balance', 'importance': 0.08})
    if employee.years_since_last_promotion >= 4:
        factors.append({'feature': 'No Recent Promotion', 'importance': 0.07})
    if employee.environment_satisfaction <= 2:
        factors.append({'feature': 'Low Environment Satisfaction', 'importance': 0.07})

    return factors[:5]


# ─── Burnout / NLP Sentiment ──────────────────────────────────────────────────

_sentiment_pipeline = None


def _load_sentiment_pipeline():
    """Load HuggingFace sentiment analysis pipeline (lazy loading)."""
    global _sentiment_pipeline
    if _sentiment_pipeline is not None:
        return _sentiment_pipeline

    try:
        from transformers import pipeline
        # Using distilbert-base fine-tuned on SST-2 for sentiment
        _sentiment_pipeline = pipeline(
            'sentiment-analysis',
            model='distilbert-base-uncased-finetuned-sst-2-english',
            truncation=True,
            max_length=512
        )
        logger.info("Sentiment pipeline loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load sentiment pipeline: {e}")
        _sentiment_pipeline = None

    return _sentiment_pipeline


def analyze_burnout_sentiment(text: str) -> dict:
    """
    Analyze sentiment of a burnout assessment text.
    Returns { score, label, burnout_level }
    """
    pipeline = _load_sentiment_pipeline()

    if pipeline is not None:
        try:
            result = pipeline(text[:512])[0]
            label = result['label']  # POSITIVE or NEGATIVE
            confidence = result['score']

            # Convert to -1 to 1 scale
            score = confidence if label == 'POSITIVE' else -confidence

        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            score, label = _keyword_sentiment(text)
    else:
        score, label = _keyword_sentiment(text)

    # Map sentiment to burnout level
    burnout_level = _score_to_burnout_level(score)

    return {
        'score': round(score, 4),
        'label': label,
        'burnout_level': burnout_level
    }


def _keyword_sentiment(text: str) -> tuple:
    """Simple keyword-based sentiment fallback."""
    text_lower = text.lower()
    negative_keywords = [
        'exhausted', 'tired', 'overwhelmed', 'stressed', 'burnt out',
        'burnout', 'anxious', 'depressed', 'demotivated', 'hopeless',
        'struggling', 'frustrated', 'unhappy', 'toxic', 'pressure'
    ]
    positive_keywords = [
        'great', 'excellent', 'happy', 'motivated', 'energized',
        'productive', 'focused', 'good', 'well', 'positive', 'enjoying'
    ]

    neg_count = sum(1 for k in negative_keywords if k in text_lower)
    pos_count = sum(1 for k in positive_keywords if k in text_lower)

    if neg_count > pos_count:
        score = -0.5 - (min(neg_count, 5) * 0.05)
        label = 'NEGATIVE'
    elif pos_count > neg_count:
        score = 0.5 + (min(pos_count, 5) * 0.05)
        label = 'POSITIVE'
    else:
        score = 0.0
        label = 'NEUTRAL'

    return max(-0.99, min(0.99, score)), label


def _score_to_burnout_level(score: float) -> str:
    """Map sentiment score to burnout level."""
    if score >= 0.3:
        return 'low'
    elif score >= -0.1:
        return 'moderate'
    elif score >= -0.5:
        return 'high'
    else:
        return 'critical'


# ─── Gemini Performance Review ────────────────────────────────────────────────

def generate_performance_review(employee, period: str, reviewer_notes: str = '') -> str:
    """
    Generate an AI performance review using Google Gemini API.
    Returns the generated review text.
    """
    import google.generativeai as genai

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return _fallback_performance_review(employee, period)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')

        # Build employee context for the prompt
        dept = employee.department.name if employee.department else 'N/A'
        satisfaction_map = {1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High'}
        performance_map = {1: 'Low', 2: 'Good', 3: 'Excellent', 4: 'Outstanding'}
        wlb_map = {1: 'Bad', 2: 'Good', 3: 'Better', 4: 'Best'}

        prompt = f"""
You are an experienced HR manager writing a professional performance review.
Generate a balanced, specific, and constructive performance review for the following employee.
The review should be professional, empathetic, and actionable. Write in third person.
Length: approximately 250-350 words. Format with clear paragraphs.

Employee Details:
- Name: {employee.full_name}
- Role: {employee.job_role}
- Department: {dept}
- Years at Company: {employee.years_at_company}
- Performance Rating: {performance_map.get(employee.performance_rating, 'Good')}
- Job Satisfaction: {satisfaction_map.get(employee.job_satisfaction, 'Medium')}
- Work-Life Balance: {wlb_map.get(employee.work_life_balance, 'Good')}
- Attendance: {employee.attendance_percentage}%
- Review Period: {period}
- Training sessions last year: {employee.training_times_last_year}
{f'- Reviewer Notes: {reviewer_notes}' if reviewer_notes else ''}

Write a professional performance review that:
1. Opens with an overall assessment
2. Highlights key strengths based on the data
3. Suggests specific areas for improvement
4. Closes with forward-looking development goals

Do NOT include any preamble or meta-commentary. Start directly with the review.
"""

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"AI generation failed: {e}")
        return _fallback_performance_review(employee, period)


def _fallback_performance_review(employee, period: str) -> str:
    """Fallback template when Gemini API is unavailable."""
    dept = employee.department.name if employee.department else 'the department'
    performance_map = {1: 'requires improvement', 2: 'meets expectations',
                       3: 'exceeds expectations', 4: 'outstanding performance'}
    perf_text = performance_map.get(employee.performance_rating, 'meets expectations')

    return f"""Performance Review – {employee.full_name} | {period}

{employee.full_name} has demonstrated {perf_text} during the {period} review period in their role as {employee.job_role} within {dept}.

Over the course of this period, {employee.full_name} has maintained an attendance record of {employee.attendance_percentage}%, reflecting a strong commitment to their responsibilities. Their engagement with training opportunities — having completed {employee.training_times_last_year} training sessions — highlights a proactive approach to professional development.

Key strengths observed include consistent contribution to team objectives and reliable performance in core job functions. With {employee.years_at_company} year(s) at the company, {employee.full_name} brings valuable institutional knowledge that benefits both peers and management.

Areas for growth include deepening technical expertise relevant to the evolving demands of the {employee.job_role} role, and exploring cross-functional collaboration opportunities. Management encourages {employee.full_name} to set specific development milestones for the next review cycle.

Looking ahead, we are confident that {employee.full_name} has the capability and drive to take on greater responsibilities. We encourage continued engagement with leadership programs and mentorship opportunities available within the organization.

This review was generated on behalf of the HR team. Please discuss any feedback directly with your line manager.
"""
