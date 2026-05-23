"""
Employees app models.
Core HR data models for employees and their related records.
"""

from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    head_name = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Employee(models.Model):
    """
    Core employee model.
    Based on IBM HR Analytics dataset structure for ML compatibility.
    """
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('on_leave', 'On Leave'),
        ('terminated', 'Terminated'),
    ]
    EDUCATION_CHOICES = [
        (1, 'Below College'),
        (2, 'College'),
        (3, 'Bachelor'),
        (4, 'Master'),
        (5, 'Doctor'),
    ]
    JOB_SATISFACTION_CHOICES = [(1, 'Low'), (2, 'Medium'), (3, 'High'), (4, 'Very High')]
    WORK_LIFE_CHOICES = [(1, 'Bad'), (2, 'Good'), (3, 'Better'), (4, 'Best')]
    PERFORMANCE_CHOICES = [(1, 'Low'), (2, 'Good'), (3, 'Excellent'), (4, 'Outstanding')]
    MARITAL_CHOICES = [('Single', 'Single'), ('Married', 'Married'), ('Divorced', 'Divorced')]

    # Personal info
    employee_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    age = models.IntegerField()
    marital_status = models.CharField(max_length=10, choices=MARITAL_CHOICES, default='Single')

    # Job info
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    job_role = models.CharField(max_length=100)
    job_level = models.IntegerField(default=1)  # 1-5
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # HR Analytics fields (for ML model)
    years_at_company = models.IntegerField(default=0)
    years_in_current_role = models.IntegerField(default=0)
    years_since_last_promotion = models.IntegerField(default=0)
    years_with_curr_manager = models.IntegerField(default=0)
    num_companies_worked = models.IntegerField(default=1)
    total_working_years = models.IntegerField(default=0)
    training_times_last_year = models.IntegerField(default=0)
    distance_from_home = models.IntegerField(default=5)  # km
    monthly_income = models.IntegerField(default=50000)
    percent_salary_hike = models.IntegerField(default=10)

    # Satisfaction metrics
    education = models.IntegerField(choices=EDUCATION_CHOICES, default=3)
    job_satisfaction = models.IntegerField(choices=JOB_SATISFACTION_CHOICES, default=3)
    environment_satisfaction = models.IntegerField(choices=JOB_SATISFACTION_CHOICES, default=3)
    relationship_satisfaction = models.IntegerField(choices=JOB_SATISFACTION_CHOICES, default=3)
    work_life_balance = models.IntegerField(choices=WORK_LIFE_CHOICES, default=3)
    performance_rating = models.IntegerField(choices=PERFORMANCE_CHOICES, default=3)

    # Attendance
    business_travel = models.CharField(
        max_length=30,
        choices=[('Non-Travel', 'Non-Travel'), ('Travel_Rarely', 'Travel Rarely'), ('Travel_Frequently', 'Travel Frequently')],
        default='Travel_Rarely'
    )
    overtime = models.BooleanField(default=False)
    attendance_percentage = models.FloatField(default=95.0)

    # Metadata
    hire_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"

    class Meta:
        ordering = ['full_name']


class BurnoutAssessment(models.Model):
    """
    Weekly self-assessment text submitted by/about employees.
    Used for NLP sentiment analysis and burnout detection.
    """
    BURNOUT_LEVEL_CHOICES = [
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='burnout_assessments')
    assessment_text = models.TextField()
    sentiment_score = models.FloatField(null=True, blank=True)  # -1 to 1 (negative to positive)
    sentiment_label = models.CharField(max_length=20, blank=True)  # POSITIVE / NEGATIVE / NEUTRAL
    burnout_level = models.CharField(max_length=10, choices=BURNOUT_LEVEL_CHOICES, blank=True)
    week_number = models.IntegerField()
    year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.full_name} - Week {self.week_number}/{self.year}"

    class Meta:
        ordering = ['-created_at']
        unique_together = ['employee', 'week_number', 'year']


class PerformanceReview(models.Model):
    """Stores generated and edited performance reviews."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    review_period = models.CharField(max_length=50)  # e.g. "Q1 2024"
    generated_review = models.TextField()  # AI-generated text
    final_review = models.TextField(blank=True)  # HR-edited version
    reviewer_notes = models.TextField(blank=True)
    is_finalized = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ['employee', 'review_period']

    def __str__(self):
        return f"{self.employee.full_name} - {self.review_period}"

    class Meta:
        ordering = ['-created_at']
