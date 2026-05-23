"""
MindPath URL Configuration
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/employees/', include('employees.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/ai/', include('ai_engine.urls')),
]
