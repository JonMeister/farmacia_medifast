

from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.tickets.models import (Caja, Servicio, Horario, Turno, Factura)
from apps.tickets.serializers import (CajaSerializer, ServicioSerializer, HorarioSerializer, TurnoSerializer, FacturaSerializers)
from apps.users.models import Cliente


class CajaViewSet(viewsets.ModelViewSet):

    queryset = Caja.objects.all()
    serializer_class = CajaSerializer


class ServicioViewSet(viewsets.ModelViewSet):

    queryset = Servicio.objects.filter(Estado = True)
    serializer_class = ServicioSerializer

    def destroy(self, request, *args, **kwargs):
        
        servicio = self.get_object()
        servicio.Estado = False
        servicio.save()
        return Response({'message':'Servicio Deshabilitado'}, status  = status.HTTP_204_NO_CONTENT)
    
class HorarioViewSet(viewsets.ModelViewSet):

    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer


class TurnoViewSet(viewsets.ModelViewSet):

    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer

    def destroy(self, request, *args, **kwargs):
        return Response({'detail': 'No se permite eliminar Turnos.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def perform_create(self, serializer):
        cedula = self.request.data.get('Cedula_manual')
        try:
            cliente = Cliente.objects.get(ID_Usuario__cc=cedula)
        except Cliente.DoesNotExist:
            cliente = Cliente.objects.get(pk=1)  # cliente por defecto

        serializer.save(ID_Cliente=cliente)
    

class FacturaViewSet(viewsets.ModelViewSet):

    queryset = Factura.objects.all()
    serializer_class = FacturaSerializers

    def destroy(self, request, *args, **kwargs):
        return Response({'detail': 'No se permite eliminar Facturas.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)






































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