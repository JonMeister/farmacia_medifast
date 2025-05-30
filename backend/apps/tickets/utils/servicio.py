from ..models import Servicio
from django.shortcuts import get_object_or_404

def get_servicio_prioridad(servicio_id: int) -> int:
    """Retorna la prioridad de un servicio dado su ID"""
    servicio = get_object_or_404(Servicio, id=servicio_id)
    return servicio.Prioridad

def get_servicio_nombre(servicio_id: int) -> str:
    """Retorna el nombre de un servicio dado su ID"""
    servicio = get_object_or_404(Servicio, id=servicio_id)
    return servicio.Nombre

def buscar_servicio_por_nombre(nombre: str) -> Servicio:
    """Busca un servicio por nombre y retorna todos sus campos"""
    return get_object_or_404(Servicio, Nombre=nombre)

def get_servicio_estado(servicio_id: int) -> bool:
    """Retorna si un servicio está activo o inactivo"""
    servicio = get_object_or_404(Servicio, id=servicio_id)
    return servicio.Estado

def get_servicios_deshabilitados():
    """Retorna todos los servicios deshabilitados"""
    return Servicio.objects.filter(Estado=False)
