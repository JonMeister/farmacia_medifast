from django.db import models
from apps.users.models import User  # Eliminar la importación de Cajero

class UsuarioEspera(models.Model):
    # Esta clase está bien, no requiere cambios
    id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE) 
    hora_llegada = models.DateTimeField()
    hora_atencion = models.DateTimeField(null=True, blank=True)
    hora_salida = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True,blank=True)

    def __str__(self):
        return f"Usuario en espera: {self.usuario.cc}"

class CajeroUsuarioEspera(models.Model):
    # Modificar esta línea para apuntar a User con restricción
    cajero = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        limit_choices_to={'is_cajero': True}  # Restricción para que solo incluya cajeros
    )
    usuario_espera = models.ForeignKey(UsuarioEspera, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True,blank=True)

    class Meta:
        unique_together = ('cajero', 'usuario_espera') 

    def __str__(self):
        # El cajero ahora es un objeto User, así que podemos acceder a sus campos directamente
        return f"Cajero {self.cajero.cc} - Usuario {self.usuario_espera.usuario.cc}"