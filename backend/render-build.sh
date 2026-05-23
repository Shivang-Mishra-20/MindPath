#!/usr/bin/env bash
# render-build.sh
# Build script for Render deployment.
# Add this as the Build Command in Render dashboard.

set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py seed_data
python manage.py train_model
