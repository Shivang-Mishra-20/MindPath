from django.urls import path
from .views import (
    EmployeeListView, EmployeeDetailView,
    DepartmentListView,
    BurnoutAssessmentListView,
    PerformanceReviewListView, PerformanceReviewDetailView,
)

urlpatterns = [
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('', EmployeeListView.as_view(), name='employee-list'),
    path('<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('burnout/', BurnoutAssessmentListView.as_view(), name='burnout-list'),
    path('reviews/', PerformanceReviewListView.as_view(), name='review-list'),
    path('reviews/<int:pk>/', PerformanceReviewDetailView.as_view(), name='review-detail'),
]
