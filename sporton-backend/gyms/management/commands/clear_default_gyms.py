from django.core.management.base import BaseCommand

from gyms.models import Gym

# `seed_gym_data` bilan bir xil — demo / default zallar
SEED_GYM_NAMES = (
    'Titan Sport Club',
    'Muscle Factory',
    'FitLife Center',
    'Power Zone Gym',
    'Champion Fitness',
    'Elite Sport Palace',
    'Body Art Fitness',
    'Pro Fitness Club',
    'Humo Sport Complex',
    'Namangan CrossFit',
)


class Command(BaseCommand):
    help = 'Remove demo gyms created by seed_gym_data (does not touch user-added gyms).'

    def handle(self, *args, **options):
        qs = Gym.objects.filter(name__in=SEED_GYM_NAMES)
        count = qs.count()
        qs.delete()
        self.stdout.write(
            self.style.SUCCESS(f'Removed {count} default (seed) gym record(s).')
        )
