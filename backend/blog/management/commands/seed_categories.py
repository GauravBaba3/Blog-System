from django.core.management.base import BaseCommand

from blog.models import Category


class Command(BaseCommand):
    help = 'Seed default blog categories for development'

    def handle(self, *args, **options):
        categories = [
            ('Technology', 'Posts about programming, software, and tech'),
            ('Travel', 'Travel stories and guides'),
            ('Food', 'Recipes, reviews, and food adventures'),
            ('Lifestyle', 'Personal growth, habits, and daily life'),
            ('Django', 'Tutorials and tips for Django developers'),
        ]

        created = 0
        for name, description in categories:
            _, was_created = Category.objects.get_or_create(
                name=name,
                defaults={'description': description},
            )
            if was_created:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f'Seed complete. {created} new categories created.')
        )
