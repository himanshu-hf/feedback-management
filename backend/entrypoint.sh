#!/bin/sh
set -e

# Run migrations
uv run backend/manage.py migrate

# Create superuser if it doesn't exist
uv run backend/manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username="${DJANGO_SUPERUSER_USERNAME}").exists():
    User.objects.create_superuser(
        "${DJANGO_SUPERUSER_USERNAME}",
        "${DJANGO_SUPERUSER_EMAIL}",
        "${DJANGO_SUPERUSER_PASSWORD}"
    )
EOF

# Start the server
uv run backend/manage.py runserver 0.0.0.0:8000