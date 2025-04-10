from django.db import models
from apps.users.models import User,Cajero

class UsuarioEspera(models.Model):
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
    cajero = models.ForeignKey(Cajero, on_delete=models.CASCADE)
    usuario_espera = models.ForeignKey(UsuarioEspera, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True,blank=True)

    class Meta:
        unique_together = ('cajero', 'usuario_espera') 

    def __str__(self):
        return f"Cajero {self.cajero.cc} - Usuario {self.usuario_espera.usuario.cc}"
