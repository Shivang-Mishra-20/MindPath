from rest_framework import serializers
from .models import AttritionPrediction
from employees.serializers import EmployeeListSerializer


class AttritionPredictionSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)
    department = serializers.CharField(source='employee.department.name', read_only=True)
    job_role = serializers.CharField(source='employee.job_role', read_only=True)

    class Meta:
        model = AttritionPrediction
        fields = [
            'id', 'employee', 'employee_name', 'employee_id_code',
            'department', 'job_role', 'risk_score', 'risk_level',
            'top_factors', 'prediction_date'
        ]
