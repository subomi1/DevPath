from django.db import migrations
from django.utils.text import slugify

CATEGORIES = [
    'Coding Standards',
    'Git Workflow',
    'API Documentation',
    'Environment Setup',
    'Security Best Practices',
    'FAQs',
    'Internal Policies',
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model('knowledge_base', 'Category')
    for name in CATEGORIES:
        Category.objects.get_or_create(name=name, defaults={'slug': slugify(name)})


def remove_categories(apps, schema_editor):
    Category = apps.get_model('knowledge_base', 'Category')
    Category.objects.filter(name__in=CATEGORIES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('knowledge_base', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_code=remove_categories),
    ]