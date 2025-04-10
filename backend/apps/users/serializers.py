from rest_framework import serializers
from apps.users.models import User,Cajero

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'cc', 'phone_number', 'historia_c',
            'prioridad', 'dob', 'is_staff', 'is_active', 'created_at', 'updated_at', 'deleted_at'
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


class CajeroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cajero
        fields = '__all__'
