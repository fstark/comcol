from rest_framework import serializers
from .models import Computer, Picture
from django.conf import settings
import os

class PictureSerializer(serializers.ModelSerializer):
    thumb = serializers.SerializerMethodField()
    gallery = serializers.SerializerMethodField()
    portrait = serializers.SerializerMethodField()

    class Meta:
        model = Picture
        fields = '__all__'

    def get_full_url(self, path):
        request = self.context.get('request')
        if request is not None:
            # Always use MEDIA_URL as prefix for all images
            if not path.startswith(settings.MEDIA_URL):
                path = settings.MEDIA_URL + path if not path.startswith('/') else settings.MEDIA_URL + path[1:]
            return request.build_absolute_uri(path)
        # Fallback: build manually
        return settings.MEDIA_URL + path if not path.startswith('/') else settings.MEDIA_URL + path[1:]

    def get_thumb(self, obj):
        if obj.image:
            base, ext = os.path.splitext(obj.image.name)
            rel_path = f"{base}-thumb{ext}"
            return self.get_full_url(rel_path)
        return None

    def get_gallery(self, obj):
        if obj.image:
            base, ext = os.path.splitext(obj.image.name)
            rel_path = f"{base}-gallery{ext}"
            return self.get_full_url(rel_path)
        return None

    def get_portrait(self, obj):
        if obj.image:
            base, ext = os.path.splitext(obj.image.name)
            rel_path = f"{base}-portrait{ext}"
            return self.get_full_url(rel_path)
        return None

class ComputerSerializer(serializers.ModelSerializer):
    pictures = PictureSerializer(many=True, read_only=True)

    class Meta:
        model = Computer
        fields = '__all__'