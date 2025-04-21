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
        # Always return a relative URL under /media
        if not path.startswith('/'):
            path = '/' + path
        # Ensure path starts with /media/
        if not path.startswith('/media/'):
            path = '/media' + path
        return path

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
        return self.get_full_url(obj.image.url)  # Return relative URL prefixed with /computers

class ComputerSerializer(serializers.ModelSerializer):
    pictures = PictureSerializer(many=True, read_only=True)

    class Meta:
        model = Computer
        fields = '__all__'