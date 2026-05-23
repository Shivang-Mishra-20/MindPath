"""
Employees app serializers.
"""

from rest_framework import serializers
from .models import Employee, Department, BurnoutAssessment, PerformanceReview


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'head_name', 'employee_count']

    def get_employee_count(self, obj):
        return obj.employees.filter(status='active').count()


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'full_name', 'email', 'gender', 'age',
            'department_name', 'job_role', 'job_level', 'status',
            'years_at_company', 'monthly_income', 'performance_rating',
            'attendance_percentage',
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail and create/update views."""
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'


class BurnoutAssessmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = BurnoutAssessment
        fields = [
            'id', 'employee', 'employee_name', 'assessment_text',
            'sentiment_score', 'sentiment_label', 'burnout_level',
            'week_number', 'year', 'created_at'
        ]
        read_only_fields = ['sentiment_score', 'sentiment_label', 'burnout_level']


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = PerformanceReview
        fields = '__all__'
