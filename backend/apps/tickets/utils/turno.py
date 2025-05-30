from ..models import Turno, Servicio
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

def contar_turnos_por_servicio(servicio_id: int) -> int:
    """Cuenta cuántos turnos prestaron un servicio específico"""
    return Turno.objects.filter(ID_Servicio_id=servicio_id).count()

def contar_turnos_por_tipo_usuario():
    """Retorna un diccionario con la cantidad de turnos de clientes y no clientes"""
    turnos_clientes = Turno.objects.filter(Cedula_manual='').count()
    turnos_no_clientes = Turno.objects.exclude(Cedula_manual='').count()
    return {
        'clientes': turnos_clientes,
        'no_clientes': turnos_no_clientes
    }

def contar_turnos_por_estado():
    """Retorna la cantidad de turnos terminados y no terminados"""
    turnos_terminados = Turno.objects.filter(estado='terminado').count()
    turnos_no_terminados = Turno.objects.exclude(estado='terminado').count()
    return {
        'terminados': turnos_terminados,
        'no_terminados': turnos_no_terminados
    }

def contar_turnos_por_dia(fecha: datetime) -> int:
    """Cuenta cuántos turnos fueron creados en un día específico"""
    return Turno.objects.filter(
        created_at__date=fecha.date()
    ).count()

def obtener_info_turno(turno_id):
    """Obtiene información de la caja y fechas de un turno"""
    try:
        turno = Turno.objects.get(id=turno_id)
        return {
            'caja_id': turno.ID_Caja.id,
            'caja_estado': turno.ID_Caja.Estado,
            'fecha_creacion': turno.created_at,
            'fecha_actualizacion': turno.updated_at
        }
    except Turno.DoesNotExist:
        return None

def obtener_cliente_turno(turno_id: int) -> dict:
    """Obtiene información del cliente asociado a un turno"""
    turno = get_object_or_404(Turno, id=turno_id)
    if turno.Cedula_manual:
        return {'es_cliente': False, 'cedula': turno.Cedula_manual}
    
    cliente = turno.ID_Cliente
    usuario = cliente.ID_Usuario
    return {
        'es_cliente': True,
        'cliente': {
            'id': cliente.id,
            'prioritario': cliente.prioritario,
            'usuario': {
                'id': usuario.id,
                'cc': usuario.cc,
                'first_name': usuario.first_name,
                'last_name': usuario.last_name,
                'email': usuario.email,
                'phone_number': usuario.phone_number
            }
        }
    }

def obtener_turnos_servicio_deshabilitado():
    """Obtiene todos los turnos cuyo servicio está deshabilitado"""
    return Turno.objects.filter(ID_Servicio__Estado=False)

def buscar_turno_por_cedula(cedula: str):
    """Busca un turno por la cédula del cliente"""
    return Turno.objects.filter(
        Q(ID_Cliente__ID_Usuario__cc=cedula) | Q(Cedula_manual=cedula)
    ).first()

def contar_turnos_periodo(fecha_inicio: datetime, fecha_fin: datetime) -> int:
    """Cuenta cuántos turnos fueron creados en un periodo de tiempo"""
    return Turno.objects.filter(
        created_at__range=(fecha_inicio, fecha_fin)
    ).count()
