from rest_framework import serializers
from .models import Servicio, Turno, Horario, Caja, Factura

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ['id', 'Nombre', 'Prioridad', 'Estado']

class CajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = ['id', 'Estado']

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ['id', 'Hora_llegada', 'Hora_atencion', 'Hora_salida']

class TurnoSerializer(serializers.ModelSerializer):
    servicio = ServicioSerializer(source='ID_Servicio', read_only=True)
    caja = CajaSerializer(source='ID_Caja', read_only=True)

    class Meta:
        model = Turno
        fields = [
            'id', 'ID_Cliente', 'ID_Caja', 'ID_Servicio',
            'Cedula_manual', 'estado', 'created_at',
            'updated_at', 'deleted_at', 'servicio', 'caja'
        ]

class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = ['id', 'Turno', 'Producto', 'Cantidad_Producto']
