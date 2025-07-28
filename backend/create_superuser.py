#!/usr/bin/env python
"""
Script para crear superusuario en producción
Usar después del primer despliegue en Render
"""
import os
import django
from django.core.management import execute_from_command_line

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "DS1.settings")
    django.setup()
    
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    # Verificar si ya existe un superusuario
    if not User.objects.filter(is_superuser=True).exists():
        # Crear superusuario con datos de variables de entorno
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@farmacia.com')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        
        User.objects.create_superuser(
            email=admin_email,
            password=admin_password,
            nombre='Administrador',
            apellido='Sistema'
        )
        print(f"Superusuario creado: {admin_email}")
    else:
        print("Ya existe un superusuario en el sistema")
