from rest_framework import serializers
from apps.users.models import Cajero
from apps.tickets.models import UsuarioEspera, CajeroUsuarioEspera

class UsuarioEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioEspera
        fields = '__all__'

class CajeroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cajero
        fields = '__all__'

class CajeroUsuarioEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CajeroUsuarioEspera
        fields = '__all__'


class UsuarioEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioEspera
        fields = '__all__'


class CajeroUsuarioEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CajeroUsuarioEspera
        fields = '__all__'