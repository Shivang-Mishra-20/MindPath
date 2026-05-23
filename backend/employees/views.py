"""
Employees app views.
CRUD operations for employees, departments, burnout assessments, and performance reviews.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Employee, Department, BurnoutAssessment, PerformanceReview
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer,
    DepartmentSerializer, BurnoutAssessmentSerializer, PerformanceReviewSerializer
)


class DepartmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployeeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all employees with optional filters."""
        employees = Employee.objects.select_related('department').all()

        # Filter by department
        dept_id = request.query_params.get('department')
        if dept_id:
            employees = employees.filter(department_id=dept_id)

        # Filter by status
        emp_status = request.query_params.get('status')
        if emp_status:
            employees = employees.filter(status=emp_status)

        # Search by name or ID
        search = request.query_params.get('search')
        if search:
            employees = employees.filter(
                full_name__icontains=search
            ) | employees.filter(employee_id__icontains=search)

        serializer = EmployeeListSerializer(employees, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EmployeeDetailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployeeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)
        serializer = EmployeeDetailSerializer(employee)
        return Response(serializer.data)

    def put(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)
        serializer = EmployeeDetailSerializer(employee, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)
        employee.delete()
        return Response({'message': 'Employee deleted'}, status=status.HTTP_204_NO_CONTENT)


class BurnoutAssessmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all burnout assessments, optionally filtered by employee."""
        assessments = BurnoutAssessment.objects.select_related('employee').all()
        employee_id = request.query_params.get('employee')
        if employee_id:
            assessments = assessments.filter(employee_id=employee_id)
        serializer = BurnoutAssessmentSerializer(assessments, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Submit a new burnout assessment.
        NLP analysis is triggered automatically in the AI engine.
        """
        from ai_engine.services import analyze_burnout_sentiment

        serializer = BurnoutAssessmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Run sentiment analysis before saving
        text = serializer.validated_data['assessment_text']
        sentiment_data = analyze_burnout_sentiment(text)

        assessment = serializer.save(
            sentiment_score=sentiment_data['score'],
            sentiment_label=sentiment_data['label'],
            burnout_level=sentiment_data['burnout_level']
        )

        return Response(
            BurnoutAssessmentSerializer(assessment).data,
            status=status.HTTP_201_CREATED
        )


class PerformanceReviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reviews = PerformanceReview.objects.select_related('employee').all()
        employee_id = request.query_params.get('employee')
        if employee_id:
            reviews = reviews.filter(employee_id=employee_id)
        serializer = PerformanceReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class PerformanceReviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        """Update/finalize a performance review."""
        review = get_object_or_404(PerformanceReview, pk=pk)
        serializer = PerformanceReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
