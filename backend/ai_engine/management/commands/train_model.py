"""
Django management command: python manage.py train_model
Trains and saves the attrition prediction model.
"""

from django.core.management.base import BaseCommand
from django.conf import settings
import sys
import os

# Add ml_models directory to path
sys.path.insert(0, str(settings.BASE_DIR / 'ml_models'))


class Command(BaseCommand):
    help = 'Train and save the attrition prediction ML model'

    def handle(self, *args, **options):
        from train_model import train_and_save_model
        output_dir = settings.ML_MODEL_PATH
        self.stdout.write('Starting model training...')
        train_and_save_model(output_dir)
        self.stdout.write(self.style.SUCCESS('Model training complete!'))
