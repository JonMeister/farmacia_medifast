from django.db import models
from apps.products.models import Producto

class Caja(models.Model):

    Estado = models.BooleanField()

""" 
Para la tabla de Servicio no es posible la eliminación de datos, sino que simplemente es un servicio deshabilitado o habilitado,
esto sucede para no afectar la integridad de los datos en la tabla de turno, puesto que no deben eliminarse nunca los turnos,
por lógica de negocio y seguridad de la información. 
 """
class Servicio(models.Model):

    Nombre = models.CharField(max_length = 100)
    Prioridad = models.IntegerField()
    Estado = models.BooleanField() # permite saber si el servicio esta deshabilitado o habilitado

class Horario(models.Model):

    """ Tabla para la actualización de las fechas en cuanto al tiempo del turno """
    Hora_llegada = models.DateTimeField()
    Hora_atencion = models.DateTimeField()
    Hora_salida = models.DateTimeField()

class Turno(models.Model):

    """ Atributos de llaves foraneas a las tablas necesarias """
    ID_Cliente = models.ForeignKey('users.Cliente', null = False, on_delete = models.SET_DEFAULT, default = 1) # AJustar para guardar a nombre de cliente default
    ID_Caja = models.ForeignKey(Caja, null = False, on_delete = models.SET_DEFAULT, default = 1) # AJustar para guardar a nombre de caja default
    ID_Servicio = models.ForeignKey(Servicio, null = False, on_delete = models.SET_DEFAULT, default = 1) # Deshabilitar el servicio unicamente

    Cedula_manual = models.CharField(max_length = 12)
    estado = models.CharField(max_length = 20, default = 'pendiente') # Estado del turno, pendiente, atendido, cancelado, terminado
    """ Atributos necesarios para llevar registro de actualizacions y soft delete sobre la base de datos """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True,blank=True)

class Factura(models.Model):

    """ Tabla intermedia entre los productos y el turno """

    Turno = models.ForeignKey(Turno, null = False, on_delete = models.SET_DEFAULT, default = 1) # Es necesario conocer los productos vendidos,
                                                                                    # incluso si se llega a eliminar el turno

    Producto = models.ForeignKey(Producto, null = True, on_delete = models.SET_NULL) # Es posible que no se reclame un producto
    Cantidad_Producto = models.IntegerField() # cuanta cantidad por cada producto 
