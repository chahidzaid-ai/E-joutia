"""
ASGI config for ejoutia project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ejoutia.settings')

application = get_asgi_application()
