# Generated by Django 5.2 on 2025-04-13 16:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comcol_backend', '0002_remove_computer_pictures_picture'),
    ]

    operations = [
        migrations.AlterField(
            model_name='computer',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='computer',
            name='year',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
