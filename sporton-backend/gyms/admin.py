from django.contrib import admin

from .models import Gym


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'district', 'region', 'rating', 'is_open')
    search_fields = ('name', 'district', 'address')

