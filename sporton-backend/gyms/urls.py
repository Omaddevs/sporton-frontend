from django.urls import path

from .views import GymDetailView, GymListView

urlpatterns = [
    path('', GymListView.as_view(), name='gym_list'),
    path('<int:gym_id>/', GymDetailView.as_view(), name='gym_detail'),
]

