from rest_framework import serializers
from .models import Turno, Caja, Servicio


class CajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = '__all__'

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = '__all__'

class Turnos_de_un_cliente(serializers.ModelSerializer):

    ID_Caja = CajaSerializer()
    ID_Servicio = ServicioSerializer()

    class Meta:
        model = Turno
        fields = ['ID_Caja','ID_Servicio','Cedula_manual','created_at','updated_at','deleted_at']

