"""
Analytics app models.
Stores attrition predictions and aggregated analytics snapshots.
"""

from django.db import models
from employees.models import Employee


class AttritionPrediction(models.Model):
    """
    Stores ML-generated attrition risk scores for each employee.
    """
    RISK_LEVEL_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attrition_predictions')
    risk_score = models.FloatField()  # 0.0 to 1.0 probability
    risk_level = models.CharField(max_length=10, choices=RISK_LEVEL_CHOICES)
    prediction_date = models.DateTimeField(auto_now_add=True)

    # Top contributing features from the model (stored as text)
    top_factors = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-prediction_date']
        get_latest_by = 'prediction_date'

    def __str__(self):
        return f"{self.employee.full_name} - {self.risk_level} ({self.risk_score:.2f})"

    @staticmethod
    def get_risk_level(score: float) -> str:
        """Map probability score to risk category."""
        if score < 0.25:
            return 'low'
        elif score < 0.50:
            return 'medium'
        elif score < 0.75:
            return 'high'
        else:
            return 'critical'
