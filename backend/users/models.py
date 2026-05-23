"""
Users app models.
Extends Django's default User model with HR role information.
"""

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Extended profile for HR users.
    Linked one-to-one with Django's built-in User model.
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('hr_manager', 'HR Manager'),
        ('hr_analyst', 'HR Analyst'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='hr_analyst')
    department = models.CharField(max_length=100, blank=True)
    avatar_initials = models.CharField(max_length=3, blank=True)  # e.g. "JD" for John Doe
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

def save(self, *args, **kwargs):
    first = self.user.first_name[:1].upper() if self.user.first_name else ''
    last = self.user.last_name[:1].upper() if self.user.last_name else ''

    self.avatar_initials = (
        f"{first}{last}" or self.user.username[:2].upper()
    )

    super().save(*args, **kwargs)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
