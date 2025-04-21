import os
import sys

# Add the project root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set the DJANGO_SETTINGS_MODULE environment variable
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'comcol_backend.settings')

import django
# Initialize Django
django.setup()

from django.conf import settings
from comcol_backend.models import Computer

def clean_unused_images():
    # Path to the media/computer_pictures directory
    pictures_dir = os.path.join(settings.MEDIA_ROOT, 'computer_pictures')

    # Get all referenced image filenames from the database
    referenced_images = set()
    for computer in Computer.objects.all():
        if computer.pictures.exists():
            referenced_images.update([picture.image.name for picture in computer.pictures.all()])

    # print( f"Referenced images: {referenced_images}")

    # Get all files in the computer_pictures directory
    all_files = set(os.listdir(pictures_dir))

	# Prepend "computer_pictures/" to each file name
    all_files = {f"computer_pictures/{file}" for file in all_files}

    # print(f"All files in directory: {all_files}")

    # Find unreferenced files
    unreferenced_files = all_files - referenced_images

    # Delete unreferenced files
    for file in unreferenced_files:
        file_path = os.path.join(settings.MEDIA_ROOT, file)
        try:
            os.remove(file_path)
            print(f"Deleted: {file}")
        except Exception as e:
            print(f"Failed to delete {file}: {e}")

if __name__ == "__main__":
    clean_unused_images()