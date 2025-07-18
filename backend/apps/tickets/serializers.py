from rest_framework import serializers
from .models import Turno, Caja, Servicio, Horario, Factura
from apps.users.models import Cliente
from apps.users.serializers import ClienteSerializer

class IDTurno(serializers.Serializer):
    id = serializers.IntegerField(min_value=100000, max_value=9999999999)

class IDServicio(serializers.Serializer):
    id = serializers.IntegerField(min_value=100000, max_value=9999999999)

class NameServicio(serializers.Serializer):
    name = serializers.CharField(max_length = 100)

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'

class CajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = '__all__'

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = '__all__'

class FacturaSerializers(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = '__all__'

class Turnos_de_un_cliente(serializers.ModelSerializer):

    ID_Caja = CajaSerializer()
    ID_Servicio = ServicioSerializer()

    class Meta:
        model = Turno
        fields = ['ID_Caja','ID_Servicio','Cedula_manual','created_at','updated_at','deleted_at']

class TurnoSerializer(serializers.ModelSerializer):

    ID_Caja_data = CajaSerializer(source='ID_Caja', read_only=True)
    ID_Servicio_data = ServicioSerializer(source='ID_Servicio', read_only=True)
    ID_Horario_data = HorarioSerializer(source='ID_Horario', read_only=True)
    ID_Cliente_data = ClienteSerializer(source='ID_Cliente', read_only=True)

    ID_Caja = serializers.PrimaryKeyRelatedField(queryset=Caja.objects.all(), write_only=True)
    ID_Servicio = serializers.PrimaryKeyRelatedField(queryset=Servicio.objects.all(), write_only=True)
    ID_Horario = serializers.PrimaryKeyRelatedField(queryset=Horario.objects.all(), write_only=True)
    ID_Cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all(), write_only=True)

    class Meta:
        model = Turno
        fields = [
            'ID_Caja', 'ID_Caja_data',
            'ID_Servicio', 'ID_Servicio_data',
            'ID_Horario', 'ID_Horario_data',
            'ID_Cliente', 'ID_Cliente_data',
            'Cedula_manual', 'created_at', 'updated_at', 'deleted_at'
        ]


