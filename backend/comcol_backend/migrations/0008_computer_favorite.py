# Generated by Django 5.2 on 2025-04-20 12:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comcol_backend', '0007_picture_extension_picture_unique_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='computer',
            name='favorite',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
