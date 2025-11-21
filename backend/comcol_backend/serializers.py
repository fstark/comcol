from rest_framework import serializers
from .models import Computer, Picture
from django.conf import settings
import os

class PictureSerializer(serializers.ModelSerializer):
    thumb = serializers.SerializerMethodField()
    gallery = serializers.SerializerMethodField()
    portrait = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Picture
        fields = '__all__'

    def get_full_url(self, path):
        # Build URL using Django's MEDIA_URL setting
        media_url = settings.MEDIA_URL.rstrip('/')
        
        # Remove any leading slash from path
        if path.startswith('/'):
            path = path[1:]
        
        # Construct full URL: MEDIA_URL + path
        return f"{media_url}/{path}"

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

    def get_image(self, obj):
        # obj.image.url already includes the MEDIA_URL prefix (e.g., /computers/media/...)
        # So we return it directly without calling get_full_url
        return obj.image.url

class ComputerSerializer(serializers.ModelSerializer):
    pictures = PictureSerializer(many=True, read_only=True)

    class Meta:
        model = Computer
        fields = '__all__'