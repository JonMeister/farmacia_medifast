from rest_framework import serializers
from apps.users.models import User  # Reemplazar Cajero por User
from apps.tickets.models import UsuarioEspera, CajeroUsuarioEspera

class UsuarioEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioEspera
        fields = '__all__'

class CajeroUsuarioEsperaSerializer(serializers.ModelSerializer):
    # Si necesitas acceder a un nombre de cajero, puedes usar SerializerMethodField
    cajero_nombre = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = CajeroUsuarioEspera
        fields = '__all__'
    
    def get_cajero_nombre(self, obj):
        # Accede a los datos del cajero (que ahora es un User)
        if obj.cajero:
            return f"{obj.cajero.first_name} {obj.cajero.last_name}"
        return "Sin asignar"