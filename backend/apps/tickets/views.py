from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime

from .models import Servicio, Turno, Horario, Caja
from .serializers import ServicioSerializer, TurnoSerializer, HorarioSerializer, CajaSerializer
from .utils.servicio import (
    get_servicio_prioridad, get_servicio_nombre, buscar_servicio_por_nombre,
    get_servicio_estado, get_servicios_deshabilitados
)
from .utils.turno import (
    contar_turnos_por_servicio, contar_turnos_por_tipo_usuario,
    contar_turnos_por_estado, contar_turnos_por_dia, obtener_info_turno,
    obtener_cliente_turno, obtener_turnos_servicio_deshabilitado,
    buscar_turno_por_cedula, contar_turnos_periodo
)
from .utils.horario import (
    calcular_diferencia_horario, actualizar_horario, calcular_duraciones_horario
)

"""
RUTAS PARA SERVICIOS:
- Lista y creación: 
  GET, POST /api/tickets/servicios/
  
- Detalle, actualización y eliminación: 
  GET, PUT, DELETE /api/tickets/servicios/{id}/
  
- Obtener prioridad de servicio: 
  GET /api/tickets/servicios/{id}/prioridad/
  
- Obtener nombre de servicio: 
  GET /api/tickets/servicios/{id}/nombre/
  
- Buscar servicio por nombre: 
  GET /api/tickets/servicios/buscar/?nombre={nombre}
  
- Verificar estado de servicio: 
  GET /api/tickets/servicios/{id}/estado/
"""
class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

    @action(detail=True, methods=['get'])
    def prioridad(self, request, pk=None):
        """Obtiene la prioridad de un servicio"""
        prioridad = get_servicio_prioridad(pk)
        return Response({'prioridad': prioridad})

    @action(detail=True, methods=['get'])
    def nombre(self, request, pk=None):
        """Obtiene el nombre de un servicio"""
        nombre = get_servicio_nombre(pk)
        return Response({'nombre': nombre})

    @action(detail=False, methods=['get'])
    def buscar(self, request):
        """Busca un servicio por nombre"""
        nombre = request.query_params.get('nombre', '')
        if not nombre:
            return Response({'error': 'Nombre no proporcionado'}, status=status.HTTP_400_BAD_REQUEST)
        servicio = buscar_servicio_por_nombre(nombre)
        return Response(ServicioSerializer(servicio).data)

    @action(detail=True, methods=['get'])
    def estado(self, request, pk=None):
        """Verifica si un servicio está activo"""
        estado = get_servicio_estado(pk)
        return Response({'estado': estado})

"""
RUTAS PARA CAJAS:
- Lista y creación: 
  GET, POST /api/tickets/cajas/
  
- Detalle, actualización y eliminación: 
  GET, PUT, DELETE /api/tickets/cajas/{id}/
  
- Obtener estado de caja: 
  GET /api/tickets/cajas/{id}/estado/
  
- Cambiar estado de caja: 
  POST /api/tickets/cajas/{id}/cambiar_estado/
"""
class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all()
    serializer_class = CajaSerializer

    @action(detail=True, methods=['get'])
    def estado(self, request, pk=None):
        """Obtiene el estado de una caja"""
        try:
            caja = self.get_object()
            return Response({'estado': caja.Estado})
        except Caja.DoesNotExist:
            return Response({'error': 'Caja no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """Cambia el estado de una caja"""
        try:
            caja = self.get_object()
            caja.Estado = not caja.Estado
            caja.save()
            return Response({'estado': caja.Estado})
        except Caja.DoesNotExist:
            return Response({'error': 'Caja no encontrada'}, status=status.HTTP_404_NOT_FOUND)

"""
RUTAS PARA TURNOS:
- Lista y creación: 
  GET, POST /api/tickets/turnos/
  
- Detalle, actualización y eliminación: 
  GET, PUT, DELETE /api/tickets/turnos/{id}/
  
- Contar turnos por servicio: 
  GET /api/tickets/turnos/por_servicio/?servicio_id={id}
  
- Contar turnos por tipo de usuario: 
  GET /api/tickets/turnos/por_tipo_usuario/
  
- Contar turnos por estado: 
  GET /api/tickets/turnos/por_estado/
  
- Contar turnos por día: 
  GET /api/tickets/turnos/por_dia/?fecha={YYYY-MM-DD}
  
- Obtener información de caja y fechas: 
  GET /api/tickets/turnos/{id}/info_caja/
  
- Obtener información del cliente: 
  GET /api/tickets/turnos/{id}/info_cliente/
  
- Obtener turnos con servicios deshabilitados: 
  GET /api/tickets/turnos/servicios_deshabilitados/
  
- Buscar turno por cédula: 
  GET /api/tickets/turnos/por_cedula/?cedula={cedula}
  
- Contar turnos por periodo: 
  GET /api/tickets/turnos/por_periodo/?inicio={YYYY-MM-DD}&fin={YYYY-MM-DD}
"""
class TurnoViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer

    @action(detail=False, methods=['get'])
    def por_servicio(self, request):
        """Cuenta turnos por servicio"""
        servicio_id = request.query_params.get('servicio_id')
        if not servicio_id:
            return Response({'error': 'ID de servicio no proporcionado'}, status=status.HTTP_400_BAD_REQUEST)
        cantidad = contar_turnos_por_servicio(servicio_id)
        return Response({'cantidad': cantidad})

    @action(detail=False, methods=['get'])
    def por_tipo_usuario(self, request):
        """Cuenta turnos por tipo de usuario"""
        return Response(contar_turnos_por_tipo_usuario())

    @action(detail=False, methods=['get'])
    def por_estado(self, request):
        """Cuenta turnos por estado"""
        return Response(contar_turnos_por_estado())

    @action(detail=False, methods=['get'])
    def por_dia(self, request):
        """Cuenta turnos por día"""
        fecha_str = request.query_params.get('fecha')
        if not fecha_str:
            return Response({'error': 'Fecha no proporcionada'}, status=status.HTTP_400_BAD_REQUEST)
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d')
        cantidad = contar_turnos_por_dia(fecha)
        return Response({'cantidad': cantidad})

    @action(detail=True, methods=['get'])
    def info_caja(self, request, pk=None):
        """Obtiene información de la caja y fechas de un turno"""
        info = obtener_info_turno(pk)
        return Response(info)

    @action(detail=True, methods=['get'])
    def info_cliente(self, request, pk=None):
        """Obtiene información del cliente de un turno"""
        info = obtener_cliente_turno(pk)
        return Response(info)

    @action(detail=False, methods=['get'])
    def servicios_deshabilitados(self, request):
        """Obtiene turnos con servicios deshabilitados"""
        turnos = obtener_turnos_servicio_deshabilitado()
        return Response(TurnoSerializer(turnos, many=True).data)

    @action(detail=False, methods=['get'])
    def por_cedula(self, request):
        """Busca un turno por cédula"""
        cedula = request.query_params.get('cedula')
        if not cedula:
            return Response({'error': 'Cédula no proporcionada'}, status=status.HTTP_400_BAD_REQUEST)
        turno = buscar_turno_por_cedula(cedula)
        if not turno:
            return Response({'error': 'Turno no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TurnoSerializer(turno).data)

    @action(detail=False, methods=['get'])
    def por_periodo(self, request):
        """Cuenta turnos en un periodo de tiempo"""
        inicio = request.query_params.get('inicio')
        fin = request.query_params.get('fin')
        if not inicio or not fin:
            return Response({'error': 'Fechas no proporcionadas'}, status=status.HTTP_400_BAD_REQUEST)
        fecha_inicio = datetime.strptime(inicio, '%Y-%m-%d')
        fecha_fin = datetime.strptime(fin, '%Y-%m-%d')
        cantidad = contar_turnos_periodo(fecha_inicio, fecha_fin)
        return Response({'cantidad': cantidad})

"""
RUTAS PARA HORARIOS:
- Lista y creación: 
  GET, POST /api/tickets/horarios/
  
- Detalle, actualización y eliminación: 
  GET, PUT, DELETE /api/tickets/horarios/{id}/
  
- Calcular diferencia de tiempo: 
  GET /api/tickets/horarios/{id}/diferencia_tiempo/
  
- Obtener duraciones detalladas: 
  GET /api/tickets/horarios/{id}/duraciones/
  
- Actualizar fechas de horario: 
  PUT /api/tickets/horarios/{id}/actualizar_fechas/
  Body: {
    "Hora_llegada": "2024-05-29T10:00:00Z",
    "Hora_atencion": "2024-05-29T10:15:00Z",
    "Hora_salida": "2024-05-29T10:30:00Z"
  }
"""
class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer

    @action(detail=True, methods=['get'])
    def diferencia_tiempo(self, request, pk=None):
        """Calcula la diferencia entre hora de llegada y salida"""
        horario = self.get_object()
        diferencia = calcular_diferencia_horario(horario.Hora_llegada, horario.Hora_salida)
        return Response({'diferencia_minutos': diferencia.total_seconds() / 60})

    @action(detail=True, methods=['get'])
    def duraciones(self, request, pk=None):
        """Obtiene información detallada de los tiempos del horario"""
        horario = self.get_object()
        duraciones = calcular_duraciones_horario(horario)
        return Response(duraciones)

    @action(detail=True, methods=['put'])
    def actualizar_fechas(self, request, pk=None):
        """Actualiza las fechas de un horario"""
        datos = request.data
        horario = actualizar_horario(pk, **datos)
        return Response(HorarioSerializer(horario).data)

"""
1. Obtener prioridad de servicio por ID
GET http://localhost:8000/api/tickets/servicios/{id}/prioridad/
Ejemplo: http://localhost:8000/api/tickets/servicios/1/prioridad/

2. Obtener nombre de servicio por ID
GET http://localhost:8000/api/tickets/servicios/{id}/nombre/
Ejemplo: http://localhost:8000/api/tickets/servicios/1/nombre/

3. Buscar servicio por nombre
GET http://localhost:8000/api/tickets/servicios/buscar/?nombre=Farmacia

4. Contar turnos por servicio
GET http://localhost:8000/api/tickets/turnos/por_servicio/?servicio_id=1

5. Verificar estado de servicio
GET http://localhost:8000/api/tickets/servicios/{id}/estado/
Ejemplo: http://localhost:8000/api/tickets/servicios/1/estado/

6. Contar turnos por tipo de usuario
GET http://localhost:8000/api/tickets/turnos/por_tipo_usuario/

7. Contar turnos por estado
GET http://localhost:8000/api/tickets/turnos/por_estado/

8. Contar turnos por día
GET http://localhost:8000/api/tickets/turnos/por_dia/?fecha=2024-05-29

9. Obtener información de caja y fechas de un turno
GET http://localhost:8000/api/tickets/turnos/{id}/info_caja/
Ejemplo: http://localhost:8000/api/tickets/turnos/1/info_caja/

10. Obtener información del cliente de un turno
GET http://localhost:8000/api/tickets/turnos/{id}/info_cliente/
Ejemplo: http://localhost:8000/api/tickets/turnos/1/info_cliente/

11. Calcular diferencia de tiempo en horario
GET http://localhost:8000/api/tickets/horarios/{id}/diferencia_tiempo/
GET http://localhost:8000/api/tickets/horarios/{id}/duraciones/
Ejemplos: 
Tiempo total:
http://localhost:8000/api/tickets/horarios/1/diferencia_tiempo/
Tiempo detallado:
http://localhost:8000/api/tickets/horarios/1/duraciones/

12. Obtener turnos con servicios deshabilitados
GET http://localhost:8000/api/tickets/turnos/servicios_deshabilitados/

13. Buscar turno por cédula
GET http://localhost:8000/api/tickets/turnos/por_cedula/?cedula=0000000000

14. Contar turnos por periodo
GET http://localhost:8000/api/tickets/turnos/por_periodo/?inicio=2024-05-01&fin=2024-05-29

15. Actualizar fechas de horario
PUT http://localhost:8000/api/tickets/horarios/{id}/actualizar_fechas/
Ejemplo: http://localhost:8000/api/tickets/horarios/1/actualizar_fechas/

    {
        "Hora_llegada": "2024-05-29T10:00:00Z",
        "Hora_atencion": "2024-05-29T10:15:00Z",
        "Hora_salida": "2024-05-29T10:30:00Z"
    }

"""