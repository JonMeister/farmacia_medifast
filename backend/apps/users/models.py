from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser, Group, Permission
from .manager import CustomUserManager

class User(AbstractUser):
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
    historia_c = models.ImageField(upload_to='historias_clinicas/', null=True, blank=True)
    prioridad = models.BooleanField(default=False)
    dob = models.DateTimeField()
    
    # Campos de roles personalizados
    is_client = models.BooleanField(default=True)
    is_cajero = models.BooleanField(default=False)
    
    groups = models.ManyToManyField(Group, related_name="custom_user_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True,blank=True)

    USERNAME_FIELD = 'cc'
    REQUIRED_FIELDS = ['first_name','last_name','email','phone_number']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name} - CC: {self.cc}"

    class Meta:
        db_table = 'USER'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['id']

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




"""def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        self.first_name = self.first_name.upper()
        self.last_name = self.last_name.upper()
        self.email = self.email.lower()
        super(User, self).save()"""