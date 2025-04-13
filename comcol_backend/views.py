import logging
from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Computer, Picture
from .serializers import ComputerSerializer, PictureSerializer

logger = logging.getLogger(__name__)

class PictureViewSet(viewsets.ModelViewSet):
    queryset = Picture.objects.all()
    serializer_class = PictureSerializer

class ComputerViewSet(viewsets.ModelViewSet):
    queryset = Computer.objects.all()
    serializer_class = ComputerSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']

class PictureUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        logger.info("Received data for picture upload: %s", request.data)
        serializer = PictureSerializer(data=request.data)
        if serializer.is_valid():
            logger.info("Serializer is valid. Saving picture.")
            serializer.save()
            return Response(serializer.data, status=201)
        logger.error("Serializer errors: %s", serializer.errors)
        return Response(serializer.errors, status=400)