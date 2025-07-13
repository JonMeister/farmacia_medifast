from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser, Group, Permission
from .manager import CustomUserManager
from django.utils import timezone

#from apps.tickets.models import Caja

class Rol(models.Model):
    administrador = models.BooleanField()
    cliente = models.BooleanField()
    Empleado = models.BooleanField()

    # No hay opción de borrado, ni soft delete

class User(AbstractUser):

    """ Atributos necesarios para llevar registro de actualizacions y soft delete sobre la base de datos """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True,blank=True)

    """ Cedula de ciudadania, atributo que se manejara para busquedas, no obstante no será llave primaria """
    cc = models.PositiveBigIntegerField(
        unique=True, blank=False, null=False,
        validators=[
            RegexValidator(
                regex=r'^\d{6,10}$',
                message=('No es un número de documento válido'),
                code='invalid_cc'
            )
        ],
        verbose_name='Cédula ciudadania') 

    """ telefono del usuario """
    phone_number = models.PositiveBigIntegerField( 
        unique=False,blank=False,null=False,
        validators=[
            RegexValidator(
                regex=r'^(3|6)\d{9}$',
                message=('No es un número de teléfono válido'),
                code='invalid_phonenumber'
            )
        ],
        verbose_name='Número teléfono'
    )

    username = None 

    dob = models.DateTimeField()

    """ No es posible elimnar ninguno de los roles iniciales, por ello se maneja como protected la llave foranea """
    rol = models.ForeignKey(Rol, on_delete = models.PROTECT, null = False, blank = False) 
    
    groups = models.ManyToManyField(Group, related_name="custom_user_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions")

    USERNAME_FIELD = 'cc'
    REQUIRED_FIELDS = ['first_name','last_name','email','phone_number']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name} - CC: {self.cc}"
    
    #######################################   Funciones del CRUD   ################################################################
    
    def soft_delete(self):
        if self.deleted_at is not None:
            self.deleted_at = timezone.now()
            self.save()


    class Meta:
        db_table = 'USER'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['id'] # metodo de organización por id

class Cliente(models.Model):

    """ LLave foranea a usuario para herencia """

    ID_Usuario = models.ForeignKey(User, on_delete = models.CASCADE, null = False)

    """ Atributos necesarios para llevar registro de actualizacions y soft delete sobre la base de datos """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True,blank=True)

    """ Prioridad para manejar la cola """  

    prioritario = models.BooleanField()

    def soft_delete(self):
        pass

class Empleado(models.Model):

    """ LLave foranea a usuario para herencia """

    ID_Usuario = models.ForeignKey(User, on_delete = models.CASCADE, null = False)

    """ Atributos necesarios para llevar registro de actualizacions y soft delete sobre la base de datos """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True,blank=True)

    """  """

    Fecha_contratacion = models.DateField()

    """  """

    ID_Caja = models.ForeignKey('tickets.Caja', default = 1,  on_delete = models.SET_DEFAULT, null = False)

class Administrador(models.Model):

    ID_Usuario = models.ForeignKey(User, on_delete = models.CASCADE, null = False)

    """ Atributos necesarios para llevar registro de actualizacions y soft delete sobre la base de datos """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True,blank=True)

    """ Constraseña que debe ser encriptada """

    Password = models.CharField(max_length = 150)







"""
class Caja(models.Model):
    numero = models.PositiveIntegerField(unique=True)
    cajero = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        limit_choices_to={'is_cajero': True},
        related_name='cajas'
    )
    activa = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Caja {self.numero} - Cajero: {self.cajero.first_name if self.cajero else 'Sin asignar'}"

    class Meta:
        db_table = 'CAJA'
        verbose_name = 'Caja'
        verbose_name_plural = 'Cajas'
        ordering = ['numero']
"""

"""
class Servicio(models.Model):
    descripcion = models.CharField(max_length=200)
    etiqueta = models.CharField(max_length=50)
    prioridad = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.etiqueta} - {self.descripcion}"

    class Meta:
        db_table = 'SERVICIO'
        verbose_name = 'Servicio'
        verbose_name_plural = 'Servicios'
        ordering = ['id']
"""