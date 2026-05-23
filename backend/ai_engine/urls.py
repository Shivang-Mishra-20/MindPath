from django.urls import path
from .views import GeneratePerformanceReviewView

urlpatterns = [
    path('generate-review/', GeneratePerformanceReviewView.as_view(), name='generate-review'),
]
