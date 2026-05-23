"""
AI Engine views.
Endpoints for triggering AI operations: burnout analysis and performance review generation.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from employees.models import Employee, PerformanceReview
from employees.serializers import PerformanceReviewSerializer
from .services import generate_performance_review


class GeneratePerformanceReviewView(APIView):
    """
    Generate an AI performance review for an employee using Gemini API.
    POST /api/ai/generate-review/
    Body: { employee_id, period, reviewer_notes (optional) }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        employee_id = request.data.get('employee_id')
        period = request.data.get('period', 'Q1 2024')
        reviewer_notes = request.data.get('reviewer_notes', '')

        if not employee_id:
            return Response(
                {'error': 'employee_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee = get_object_or_404(Employee, pk=employee_id)

        existing_review = PerformanceReview.objects.filter(
            employee=employee,
            review_period=period
        ).first()

        if existing_review:
            return Response(
                {'error': 'Review already exists for this employee and period.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate review text via Gemini
        review_text = generate_performance_review(employee, period, reviewer_notes)

        # Save the generated review
        review = PerformanceReview.objects.create(
            employee=employee,
            review_period=period,
            generated_review=review_text,
            final_review=review_text,  # Initially same; HR can edit
            reviewer_notes=reviewer_notes
        )

        serializer = PerformanceReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
