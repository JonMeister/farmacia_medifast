

from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.tickets.models import (Caja, Servicio, Horario, Turno, Factura)
from apps.tickets.serializers import (CajaSerializer, ServicioSerializer, HorarioSerializer, 
                                      TurnoSerializer, FacturaSerializers, IDServicio, NameServicio,
                                      IDTurno)
from apps.users.models import Cliente
from rest_framework.decorators import action



class CajaViewSet(viewsets.ModelViewSet):

    queryset = Caja.objects.all()
    serializer_class = CajaSerializer

"""


def buscar_servicio_por_nombre(nombre):
    try:
        servicio = Servicio.objects.get(Nombre=nombre)
        return servicio  # Puedes hacer .__dict__ para ver todos los campos
    except Servicio.DoesNotExist:
        return None

"""

class ServicioViewSet(viewsets.ModelViewSet):

    queryset = Servicio.objects.filter(Estado = True)
    serializer_class = ServicioSerializer

    def destroy(self, request, *args, **kwargs):
        
        servicio = self.get_object()
        servicio.Estado = False
        servicio.save()
        return Response({'message':'Servicio Deshabilitado'}, status  = status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods = ['post'], url_path = 'prioridad_servicio')
    def obtener_prioridad_servicio(self,request):

        serializer = IDServicio(data = request.data)
        serializer.is_valid(raise_exception=True)

        id_servicio = serializer.validated_data['id']

        try:
            servicio = Servicio.objects.get(id=id_servicio)
            return Response({'success': True,'prioridad' : servicio.Prioridad}, status = 200)
        except Servicio.DoesNotExist:
            return Response({'success': False, 'message': "Servicio no encontrado"}, status = 404)
    
    @action(detail=False, methods=['post'],url_path = 'nombre_servicio')
    def obtener_nombre_servicio(self, request):

        serializer = IDServicio(data = request.data)
        serializer.is_valid(raise_exception=True)

        id_servicio = serializer.validated_data['id']

        try:
            servicio = Servicio.objects.get(id=id_servicio)
            return Response({'success': True,'nombre' : servicio.Nombre}, status = 200)
        except Servicio.DoesNotExist:
            return Response({'success': False, 'message': "Servicio no encontrado"}, status = 404)
    
    @action(detail=False, methods=['post'], url_path = 'buscar_por_nombre')
    def buscar_servicio_por_nombre(self,request):

        serializer = NameServicio(data = request.data)
        serializer.is_valid(raise_exception=True)

        nombre = serializer.validated_data['name']

        try:
            servicio = Servicio.objects.get(Nombre = nombre)
            return Response({'success': True,'servicio' : servicio}, status = 200)
        except Servicio.DoesNotExist:
            return Response({'success': False, 'message': "Servicio no encontrado"}, status = 404)

    @action(detail=False, methods=['post'],url_path='contar_turnos_servicio')
    def contar_turnos_por_servicio(self,request):

        serializer = IDServicio(data = request.data)
        serializer.is_valid(raise_exception=True)

        id_servicio = serializer.validated_data['id']

        conteo = Turno.objects.filter(ID_Servicio_id=id_servicio).count()

        return Response({'success':True, 'conteo' : conteo}, status = 200)
    
    @action(detail=False, methods = ['post'], url_path='servicio_activo')
    def servicio_esta_activo(self,request):

        serializer = IDServicio(data = request.data)
        serializer.is_valid(raise_exception=True)

        id_servicio = serializer.validated_data['id']

        try:

            service = Servicio.objects.get(id = id_servicio)
            return Response({'success':True, 'activo': service.Estado},status = 200)
        
        except Servicio.DoesNotExist:

            return Response({'success':False, 'message': 'servicio no encontrado'}, status = 404)

    
class HorarioViewSet(viewsets.ModelViewSet):

    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer


class TurnoViewSet(viewsets.ModelViewSet):

    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer

    def destroy(self, request, *args, **kwargs):
        return Response({'detail': 'No se permite eliminar Turnos.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    

    """

    # 6.) Ver cuantos turnos son de un cliente de la base de datos y cuantos no.

    7.) Ver cuantos turnos fueron terminados y cuando no.

    8.) Cuantos turnos han sido creados en un día en particular.

    9.) Dado un turno encontrar en que caja se realizo o atendio este y en que fecha y hora.

    10.) Dado un turno saber cual cliente esta asociado ( si es cliente, sino retornar que no es cliente )


    """

    #@action(detail=False, methods = ['get'], url_path = 'contar_turnos_terminados_y_no')
    #def contar_turnos_terminados_y_no(self,request):

        #serializer = IDTurno(data = request.data)
        #serializer.is_valid(raise_exception = True)

        #id_turno = serializer.validated_data['id']

        #try:

            #turnos = Turno.objects.filter()

            #horar

            #terminados = Turno.objects.filter(finalizado=True).count()
            #no_terminados = Turno.objects.filter(finalizado=False).count()
            #return {
                #"terminados": terminados,
                #"no_terminados": no_terminados
            #}
        
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