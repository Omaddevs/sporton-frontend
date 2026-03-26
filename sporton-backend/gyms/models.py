from django.db import models


class Gym(models.Model):
    name = models.CharField(max_length=255)
    district = models.CharField(max_length=120)
    region = models.CharField(max_length=120, blank=True, default='Toshkent viloyati')
    address = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=40, blank=True, default='')

    rating = models.FloatField(default=0)
    reviews_count = models.IntegerField(default=0)
    description = models.TextField(blank=True, default='')

    monthly_price = models.IntegerField(default=0)
    entry_price = models.IntegerField(default=0)
    hours = models.CharField(max_length=80, blank=True, default='')
    is_open = models.BooleanField(default=True)

    facilities = models.JSONField(default=list, blank=True)
    sports = models.JSONField(default=list, blank=True)

    gradient = models.CharField(max_length=255, blank=True, default='')
    accent_color = models.CharField(max_length=80, blank=True, default='#0078FF')

    lat = models.FloatField(default=0)
    lng = models.FloatField(default=0)

    class Meta:
        ordering = ['-rating']

    def __str__(self):
        return self.name

