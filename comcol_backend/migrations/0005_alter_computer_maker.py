# Generated by Django 5.2 on 2025-04-13 18:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comcol_backend', '0004_computer_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='computer',
            name='maker',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
