from django.db import models

class Producto(models.Model):
    
    Nombre = models.CharField(100)
    Descripcion = models.CharField(300)
    Precio = models.IntegerField()
    Stock = models.IntegerField()
    Marca = models.CharField(200)





