from django.db.models import Q
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Gym
from .serializers import GymSerializer


def parse_bool(val):
    if val is None:
        return None
    s = str(val).strip().lower()
    if s in {'1', 'true', 'yes', 'y', 'on'}:
        return True
    if s in {'0', 'false', 'no', 'n', 'off'}:
        return False
    return None


class GymListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        region = request.query_params.get('region', '').strip()
        district = request.query_params.get('district', '').strip()
        sport = request.query_params.get('sport', '').strip()
        openNow = parse_bool(request.query_params.get('openNow'))
        minRating = request.query_params.get('minRating', '').strip()
        minReviews = request.query_params.get('minReviews', '').strip()
        priceBand = request.query_params.get('priceBand', 'any')

        qs = Gym.objects.all()

        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(district__icontains=q) | Q(address__icontains=q))

        if region:
            qs = qs.filter(region=region)
        if district:
            qs = qs.filter(district=district)

        if openNow is not None:
            qs = qs.filter(is_open=openNow)

        # Price band filters by monthly_price (matching frontend).
        if priceBand == 'lt300':
            qs = qs.filter(monthly_price__lt=300000)
        elif priceBand == '300-450':
            qs = qs.filter(monthly_price__gte=300000, monthly_price__lte=450000)
        elif priceBand == 'gt450':
            qs = qs.filter(monthly_price__gt=450000)

        if minRating:
            try:
                qs = qs.filter(rating__gte=float(minRating))
            except ValueError:
                pass

        if minReviews:
            try:
                qs = qs.filter(reviews_count__gte=int(minReviews))
            except ValueError:
                pass

        gyms = list(qs)

        if sport:
            gyms = [g for g in gyms if sport in (g.sports or [])]

        gyms.sort(key=lambda g: (-g.rating, -g.reviews_count))

        serializer = GymSerializer(gyms, many=True)
        return Response({'items': serializer.data, 'count': len(serializer.data)}, status=200)


class GymDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, gym_id):
        gym = Gym.objects.filter(id=gym_id).first()
        if not gym:
            return Response({'detail': 'Not found'}, status=404)
        return Response(GymSerializer(gym).data, status=200)

from django.shortcuts import render

# Create your views here.
