"""
Train and save the attrition prediction model.
Run: python manage.py train_model

Uses scikit-learn RandomForestClassifier on IBM HR Analytics structure.
Model is saved to ml_models/ directory for use in predictions.
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.metrics import roc_auc_score

# Add parent directory to path so we can import Django models if needed
BASE_DIR = Path(__file__).resolve().parent.parent


def create_synthetic_training_data(n_samples: int = 1000) -> pd.DataFrame:
    """
    Generate synthetic IBM HR Analytics-style training data.
    Used when real dataset is not available.
    Column structure mirrors the IBM HR dataset.
    """
    np.random.seed(42)
    n = n_samples

    data = {
        'Age': np.random.randint(18, 65, n),
        'BusinessTravel_Rarely': np.random.randint(0, 2, n),
        'BusinessTravel_Frequently': np.random.randint(0, 2, n),
        'DistanceFromHome': np.random.randint(1, 50, n),
        'Education': np.random.randint(1, 6, n),
        'EnvironmentSatisfaction': np.random.randint(1, 5, n),
        'Gender_Male': np.random.randint(0, 2, n),
        'JobLevel': np.random.randint(1, 6, n),
        'JobSatisfaction': np.random.randint(1, 5, n),
        'MonthlyIncome': np.random.randint(10000, 200000, n),
        'NumCompaniesWorked': np.random.randint(0, 10, n),
        'OverTime': np.random.randint(0, 2, n),
        'PercentSalaryHike': np.random.randint(11, 26, n),
        'PerformanceRating': np.random.choice([3, 4], n, p=[0.85, 0.15]),
        'RelationshipSatisfaction': np.random.randint(1, 5, n),
        'TotalWorkingYears': np.random.randint(0, 40, n),
        'TrainingTimesLastYear': np.random.randint(0, 7, n),
        'WorkLifeBalance': np.random.randint(1, 5, n),
        'YearsAtCompany': np.random.randint(0, 35, n),
        'YearsInCurrentRole': np.random.randint(0, 20, n),
        'YearsSinceLastPromotion': np.random.randint(0, 15, n),
        'YearsWithCurrManager': np.random.randint(0, 17, n),
        'MaritalStatus_Married': np.random.randint(0, 2, n),
        'MaritalStatus_Single': np.random.randint(0, 2, n),
    }

    df = pd.DataFrame(data)

    # Create realistic correlations

    # Overtime reduces work-life balance
    df.loc[df['OverTime'] == 1, 'WorkLifeBalance'] = np.random.choice(
        [1, 2, 3],
        size=(df['OverTime'] == 1).sum(),
        p=[0.45, 0.40, 0.15]
    )

    # Poor environment lowers job satisfaction
    poor_env = df['EnvironmentSatisfaction'] <= 2
    df.loc[poor_env, 'JobSatisfaction'] = np.random.choice(
        [1, 2, 3],
        size=poor_env.sum(),
        p=[0.45, 0.40, 0.15]
    )

    # Lower income linked with lower job level
    low_level = df['JobLevel'] <= 2
    df.loc[low_level, 'MonthlyIncome'] = np.random.randint(
        15000,
        60000,
        low_level.sum()
    )
# Improved realistic attrition probability generation

    attrition_prob = (
        0.015

    # High impact factors
        + 0.28 * df['OverTime']
        + 0.20 * (df['JobSatisfaction'] <= 2).astype(int)
        + 0.18 * (df['WorkLifeBalance'] <= 2).astype(int)
        + 0.16 * (df['EnvironmentSatisfaction'] <= 2).astype(int)

    # Career stagnation
        + 0.14 * (df['YearsSinceLastPromotion'] >= 4).astype(int)
        + 0.10 * (df['YearsInCurrentRole'] >= 6).astype(int)

    # Compensation dissatisfaction
        + 0.12 * (df['MonthlyIncome'] < 40000).astype(int)

    # Commute frustration
        + 0.10 * (df['DistanceFromHome'] > 20).astype(int)

    # Job instability
        + 0.08 * (df['NumCompaniesWorked'] >= 5).astype(int)

    # Lower performers more likely to leave
        + 0.06 * (df['PerformanceRating'] == 3).astype(int)

    # Protective factors
        - 0.10 * (df['YearsAtCompany'] > 10).astype(int)
        - 0.08 * (df['JobLevel'] >= 4).astype(int)
        - 0.07 * (df['RelationshipSatisfaction'] >= 3).astype(int)

    # Small noise only
        + np.random.normal(0, 0.01, n)
    ).clip(0, 1)

    df['Attrition'] = (np.random.uniform(0, 1, n) < attrition_prob).astype(int)

    return df


def train_and_save_model(output_dir: Path):
    """Train the attrition model and save it."""
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import classification_report, accuracy_score

    print("Generating training data...")
    df = create_synthetic_training_data(8000)

    feature_cols = [c for c in df.columns if c != 'Attrition']
    X = df[feature_cols].values
    y = df['Attrition'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("Training RandomForest model...")
    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=20,
        min_samples_leaf=2,
        min_samples_split=5,
        class_weight='balanced',  # Handle class imbalance
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Attrition', 'Attrition']))
    
    roc_auc = roc_auc_score(y_test, model.predict_proba(X_test_scaled)[:, 1])
    print(f"ROC-AUC Score: {roc_auc:.4f}")
    feature_importance = pd.DataFrame({
        'Feature': feature_cols,
        'Importance': model.feature_importances_
    }).sort_values(by='Importance', ascending=False)

    print("\nTop Feature Importances:")
    print(feature_importance.head(10))

    # Save model and scaler
    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_dir / 'attrition_model.joblib')
    joblib.dump(scaler, output_dir / 'attrition_scaler.joblib')

    print(f"\nModel saved to {output_dir}")
    return model, scaler


if __name__ == '__main__':
    # Run directly: python train_model.py
    output_path = BASE_DIR / 'ml_models'
    train_and_save_model(output_path)
