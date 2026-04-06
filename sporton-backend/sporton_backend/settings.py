"""
Django settings for sporton_backend project.
Ma'lumotlar MySQL da saqlanadi; ular server ishlamay qolganda ham diskda qoladi.
"""
import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if value is None or (isinstance(value, str) and value.strip() == ''):
        raise ImproperlyConfigured(
            f'Environment variable {name} is required. Copy .env.example to .env and set it.'
        )
    return value.strip()


SECRET_KEY = _require_env('DJANGO_SECRET_KEY')

# DJANGO_DEBUG bo‘lmasa yoki bo‘sh bo‘lsa — lokalda admin CSS va static fayllar uchun True
_debug_raw = os.environ.get('DJANGO_DEBUG', '').strip()
DEBUG = (not _debug_raw) or (_debug_raw.lower() in ('1', 'true', 'yes'))

ALLOWED_HOSTS = [
    h.strip()
    for h in _require_env('DJANGO_ALLOWED_HOSTS').split(',')
    if h.strip()
]


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'rest_framework_simplejwt',
    'accounts',
    'notifications',
    'gyms',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sporton_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sporton_backend.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': _require_env('MYSQL_DATABASE'),
        'USER': _require_env('MYSQL_USER'),
        'PASSWORD': os.environ.get('MYSQL_PASSWORD', ''),
        'HOST': _require_env('MYSQL_HOST'),
        'PORT': int(_require_env('MYSQL_PORT')),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
        'CONN_MAX_AGE': 60,
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Boshidagi "/" majburiy: aks holda WhiteNoise /static/... so‘rovlarini topmay, admin CSS yo‘qoladi
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Admin va django.contrib.staticfiles CSS/JS (to‘g‘ri static_prefix uchun STATIC_URL = '/static/')
WHITENOISE_USE_FINDERS = True
WHITENOISE_AUTOREFRESH = True
WHITENOISE_MAX_AGE = 60

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

CORS_ALLOW_ALL_ORIGINS = True

AUTH_USER_MODEL = 'accounts.User'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
