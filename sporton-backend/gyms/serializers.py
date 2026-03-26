from rest_framework import serializers

from .models import Gym


class GymSerializer(serializers.ModelSerializer):
    monthlyPrice = serializers.IntegerField(source='monthly_price')
    entryPrice = serializers.IntegerField(source='entry_price')
    reviewsCount = serializers.IntegerField(source='reviews_count')
    isOpen = serializers.BooleanField(source='is_open')
    accentColor = serializers.CharField(source='accent_color')

    class Meta:
        model = Gym
        fields = [
            'id',
            'name',
            'district',
            'region',
            'address',
            'phone',
            'rating',
            'reviewsCount',
            'description',
            'monthlyPrice',
            'entryPrice',
            'hours',
            'isOpen',
            'facilities',
            'sports',
            'gradient',
            'accentColor',
            'lat',
            'lng',
        ]

