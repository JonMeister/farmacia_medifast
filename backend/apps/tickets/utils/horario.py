from ..models import Horario
from django.utils import timezone
from datetime import datetime, timedelta

def calcular_duraciones_horario(horario: Horario) -> dict:
    # Calcula los diferentes tiempos de un horario
    tiempo_espera = horario.Hora_atencion - horario.Hora_llegada
    tiempo_atencion = horario.Hora_salida - horario.Hora_atencion
    tiempo_total = horario.Hora_salida - horario.Hora_llegada
    
    return {
        'tiempo_espera_minutos': tiempo_espera.total_seconds() / 60,
        'tiempo_atencion_minutos': tiempo_atencion.total_seconds() / 60,
        'tiempo_total_minutos': tiempo_total.total_seconds() / 60
    }

def calcular_diferencia_horario(hora_llegada: datetime, hora_salida: datetime) -> timedelta:
    """Calcula la diferencia entre la hora de llegada y salida"""
    return hora_salida - hora_llegada

def actualizar_horario(horario_id: int, **kwargs) -> Horario:
    """Actualiza las fechas y horarios de un registro específico"""
    horario = Horario.objects.filter(id=horario_id)
    horario.update(**kwargs)
    return horario.first()
