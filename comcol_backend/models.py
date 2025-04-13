from django.db import models

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
    image = models.ImageField(upload_to='computer_pictures/')

    def __str__(self):
        return f"Image for {self.computer.name}"