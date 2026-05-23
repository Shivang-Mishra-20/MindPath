from django.urls import path
from .views import (
    AttritionPredictView, AttritionPredictAllView,
    AttritionListView, DashboardStatsView
)

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('attrition/', AttritionListView.as_view(), name='attrition-list'),
    path('predict/<int:pk>/', AttritionPredictView.as_view(), name='predict-employee'),
    path('predict-all/', AttritionPredictAllView.as_view(), name='predict-all'),
]
