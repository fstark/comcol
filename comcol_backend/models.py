from django.db import models
import uuid
import os

def picture_upload_to(instance, filename):
    # Always use a UUID and .jpeg extension
    ext = 'jpeg'
    uuid_str = str(uuid.uuid4())
    instance.unique_id = uuid_str
    instance.extension = ext
    return os.path.join('computer_pictures', f'{uuid_str}.{ext}')

class Computer(models.Model):
    name = models.CharField(max_length=255)
    maker = models.CharField(max_length=255, blank=True, null=True)
    year = models.PositiveIntegerField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class Picture(models.Model):
    computer = models.ForeignKey(Computer, related_name='pictures', on_delete=models.CASCADE)
    image = models.ImageField(upload_to=picture_upload_to)
    order = models.PositiveIntegerField(default=0)
    unique_id = models.CharField(max_length=36, editable=False, db_index=True)
    extension = models.CharField(max_length=10, editable=False, default='jpeg')

    def __str__(self):
        return f"Image for {self.computer.name}"