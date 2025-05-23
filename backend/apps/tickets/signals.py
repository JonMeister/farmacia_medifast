from django.db.models.signals import post_migrate
from django.dispatch import receiver
from apps.tickets.models import Caja, Servicio, Turno
from apps.users.models import Cliente, User, Rol
from django.utils import timezone

@receiver(post_migrate)
def create_default_client(sender, **kwargs):
    Rol.objects.get_or_create(id = 1, defaults = {"administrador": False, "cliente" : True, "Empleado" : False})
    registro1 = User.objects.get_or_create(id = 1, defaults = {"cc" : 0, "first_name" : "default", 
                                                   "last_name" : "default", "email" : "default@gmail.com", "phone_number" : 0})
    Cliente.objects.get_or_create(id = 1, defaults = {"ID_Usuario" : registro1, "prioritario" : False})

@receiver(post_migrate)
def create_default_caja(sender, **kwargs):
    Caja.objects.get_or_create(id = 1, defaults = {"Estado" : False})



