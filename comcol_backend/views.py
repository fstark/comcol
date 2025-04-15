import logging
from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework import status
from .models import Computer, Picture
from .serializers import ComputerSerializer, PictureSerializer
from django.db import models

logger = logging.getLogger(__name__)

class PictureViewSet(viewsets.ModelViewSet):
    queryset = Picture.objects.all()
    serializer_class = PictureSerializer

class ComputerViewSet(viewsets.ModelViewSet):
    queryset = Computer.objects.all()
    serializer_class = ComputerSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        return Computer.objects.prefetch_related(
            models.Prefetch('pictures', queryset=Picture.objects.order_by('order'))
        )

    @action(detail=True, methods=['post'], url_path='reorder-images')
    def reorder_images(self, request, pk=None):
        computer = self.get_object()
        new_order = request.data.get('order', [])

        logger.debug(f"Reordering images for computer ID {pk}")
        logger.debug(f"New order received: {new_order}")

        if not isinstance(new_order, list):
            return Response({'error': 'Invalid order format'}, status=status.HTTP_400_BAD_REQUEST)

        pictures = list(computer.pictures.all())
        logger.debug(f"Existing pictures: {[picture.id for picture in pictures]}")

        picture_dict = {picture.id: picture for picture in pictures}

        reordered_pictures = []
        for picture_id in new_order:
            picture = picture_dict.get(picture_id)
            if picture:
                reordered_pictures.append(picture)

        # Update the order in the database
        for index, picture in enumerate(reordered_pictures):
            picture.order = index
            picture.save()

        return Response({'message': 'Image order updated successfully'}, status=status.HTTP_200_OK)

class PictureUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        logger.info("Received data for picture upload: %s", request.data)

        # Determine the highest order value for the associated computer
        computer_id = request.data.get('computer')
        if not computer_id:
            return Response({'error': 'Computer ID is required'}, status=400)

        max_order = Picture.objects.filter(computer_id=computer_id).aggregate(models.Max('order'))['order__max']
        next_order = (max_order or 0) + 1

        # Add the calculated order to the request data
        request.data['order'] = next_order

        logger.info(f"Assigning order {next_order} to the new picture.")

        serializer = PictureSerializer(data=request.data)
        if serializer.is_valid():
            logger.info("Serializer is valid. Saving picture.")
            serializer.save()
            return Response(serializer.data, status=201)
        logger.error("Serializer errors: %s", serializer.errors)
        return Response(serializer.errors, status=400)