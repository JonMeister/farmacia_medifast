from rest_framework import serializers
from apps.users.models import User, Cliente, Administrador, Rol

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'cc',
            'phone_number', 'dob', 'is_staff', 'is_active', 'created_at'
        ]

class AdministradorSerializer(serializers.ModelSerializer):

    user = UserPublicSerializer(source="ID_Usuario", read_only=True)
    ID_Usuario = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True
    )  

    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Administrador
        fields = ['ID_Usuario','id', 'user', 'created_at', 'updated_at', 'deleted_at', 'password']


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    user  = UserPublicSerializer(source = "ID_Usuario", read_only=True)
    ID_Usuario = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True
    )  
    class Meta:
        model = Cliente
        fields = ['ID_Usuario', 'user', 'created_at', 'updated_at', 'deleted_at', 'prioritario']

class obtener_creacion_actualizacion_administrador(serializers.ModelSerializer):

    class Meta:
        model = Administrador
        fields = ['created_at','updated_at'] 

class obtener_creacion_actualizacion_cliente(serializers.ModelSerializer):

    class Meta:
        model = Cliente
        fields = ['created_at','updated_at'] 

class admin_password(serializers.ModelSerializer):
    cc = serializers.IntegerField(min_value=100000, max_value=9999999999)
    neva_password = serializers.CharField(write_only=True, min_length=6)

class cc_client(serializers.ModelSerializer):
    cc = serializers.IntegerField(min_value=100000, max_value=9999999999)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id','password','first_name', 'last_name', 'email', 'cc', 'phone_number', 'rol',
            'dob', 'is_staff', 'is_active', 'created_at', 'updated_at', 'deleted_at'
        ]
        extra_kwargs = {
            'password': {'write_only': True},  # No mostrar la contraseña en respuestas
            'created_at': {'read_only': True},  # Solo lectura
            'updated_at': {'read_only': True},  # Solo lectura
            'deleted_at': {'read_only': True}   # Solo lectura
        }

    def create(self, validated_data):
        """Crear usuario con contraseña encriptada"""
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)  # Encripta la contraseña automáticamente
        user.save()
        return user

    def update(self, instance, validated_data):
        """Actualizar usuario (manteniendo encriptación de contraseña)"""
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

