
"""
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone  # Añadido esta importación que faltaba
from apps.users.models import User  # Correcto: User en lugar de Cajero
from apps.tickets.models import UsuarioEspera, CajeroUsuarioEspera
from apps.users.serializers import UserSerializer  # Ahora usamos UserSerializer para los cajeros
from apps.tickets.serializers import UsuarioEsperaSerializer, CajeroUsuarioEsperaSerializer

class UsuarioEsperaViewSet(viewsets.ModelViewSet):
    queryset = UsuarioEspera.objects.all()
    serializer_class = UsuarioEsperaSerializer

    def destroy(self, request, pk=None):
        usuario = self.get_object()
        usuario.deleted_at = timezone.now()  
        usuario.save()
        return Response({"message": "Usuario en espera desactivado"}, status=status.HTTP_204_NO_CONTENT)
    
class CajeroUsuarioEsperaViewSet(viewsets.ModelViewSet):
    queryset = CajeroUsuarioEspera.objects.all()
    serializer_class = CajeroUsuarioEsperaSerializer

"""