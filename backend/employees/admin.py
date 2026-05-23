from django.contrib import admin
from .models import Employee, Department, BurnoutAssessment, PerformanceReview
admin.site.register(Employee)
admin.site.register(Department)
admin.site.register(BurnoutAssessment)
admin.site.register(PerformanceReview)
