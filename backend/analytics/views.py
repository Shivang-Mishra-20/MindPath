"""
Analytics app views.
Provides attrition predictions and aggregated HR dashboard statistics.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Avg, Q
from django.shortcuts import get_object_or_404

from employees.models import Employee, BurnoutAssessment, Department
from .models import AttritionPrediction
from .serializers import AttritionPredictionSerializer
from ai_engine.services import predict_attrition


class AttritionPredictView(APIView):
    """
    Run attrition prediction for a single employee.
    POST /api/analytics/predict/<employee_id>/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)

        # Run ML prediction
        result = predict_attrition(employee)

        # Save prediction result
        prediction = AttritionPrediction.objects.create(
            employee=employee,
            risk_score=result['risk_score'],
            risk_level=AttritionPrediction.get_risk_level(result['risk_score']),
            top_factors=result.get('top_factors', [])
        )

        serializer = AttritionPredictionSerializer(prediction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AttritionPredictAllView(APIView):
    """
    Run attrition prediction for ALL active employees.
    POST /api/analytics/predict-all/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        employees = Employee.objects.filter(status='active').select_related('department')
        results = []

        for employee in employees:
            try:
                result = predict_attrition(employee)
                prediction = AttritionPrediction.objects.create(
                    employee=employee,
                    risk_score=result['risk_score'],
                    risk_level=AttritionPrediction.get_risk_level(result['risk_score']),
                    top_factors=result.get('top_factors', [])
                )
                results.append(AttritionPredictionSerializer(prediction).data)
            except Exception as e:
                # Log but don't fail the whole batch
                results.append({'employee_id': employee.id, 'error': str(e)})

        return Response({'predictions': results, 'total': len(results)})


class AttritionListView(APIView):
    """Get all attrition predictions (latest per employee)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):

        employee_ids = AttritionPrediction.objects.values_list(
            'employee_id', flat=True
        ).distinct()

        predictions = []

        for emp_id in employee_ids:
            latest = AttritionPrediction.objects.select_related(
                'employee',
                'employee__department'
            ).filter(
                employee_id=emp_id
            ).order_by('-prediction_date').first()

            if latest:
                predictions.append(latest)

        serializer = AttritionPredictionSerializer(predictions, many=True)
        return Response(serializer.data)


class DashboardStatsView(APIView):
    """
    Returns aggregated statistics for the main analytics dashboard.
    GET /api/analytics/dashboard/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Employee counts
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(status='active').count()
        on_leave = Employee.objects.filter(status='on_leave').count()

        # Attrition risk breakdown
        risk_distribution = {
            'low': 0,
            'medium': 0,
            'high': 0,
            'critical': 0
        }

        latest_predictions = []

        employee_ids = AttritionPrediction.objects.values_list(
            'employee_id',
            flat=True
        ).distinct()

        for emp_id in employee_ids:
            latest = AttritionPrediction.objects.filter(
                employee_id=emp_id
            ).order_by('-prediction_date').first()

            if latest:
                latest_predictions.append(latest)

        for pred in latest_predictions:
            level = pred.risk_level

            if level in risk_distribution:
                risk_distribution[level] += 1

        high_risk_count = (
            risk_distribution['high'] +
            risk_distribution['critical']
        )

        # Burnout stats
        recent_assessments = BurnoutAssessment.objects.order_by(
            '-created_at'
        )[:50]

        burnout_counts = {
            'low': 0,
            'moderate': 0,
            'high': 0,
            'critical': 0
        }

        for a in recent_assessments:
            if a.burnout_level in burnout_counts:
                burnout_counts[a.burnout_level] += 1

        # Department breakdown
        dept_stats = Department.objects.annotate(
            emp_count=Count(
                'employees',
                filter=Q(employees__status='active')
            )
        ).values('name', 'emp_count')

        # Average satisfaction scores
        avg_scores = Employee.objects.filter(
            status='active'
        ).aggregate(
            avg_job_satisfaction=Avg('job_satisfaction'),
            avg_work_life=Avg('work_life_balance'),
            avg_performance=Avg('performance_rating'),
            avg_attendance=Avg('attendance_percentage'),
        )

        return Response({
            'employee_overview': {
                'total': total_employees,
                'active': active_employees,
                'on_leave': on_leave,
                'high_risk': high_risk_count,
            },
            'attrition_risk_distribution': risk_distribution,
            'burnout_distribution': burnout_counts,
            'department_breakdown': list(dept_stats),
            'average_scores': {
                'job_satisfaction': round(avg_scores['avg_job_satisfaction'] or 0, 2),
                'work_life_balance': round(avg_scores['avg_work_life'] or 0, 2),
                'performance_rating': round(avg_scores['avg_performance'] or 0, 2),
                'attendance': round(avg_scores['avg_attendance'] or 0, 2),
            }
        })