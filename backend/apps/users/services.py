from datetime import date
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist
from .models import User, Cliente, Administrador, Empleado
from apps.tickets.models import Turno


### ========== FUNCIONES CRUD CLIENTES ==========

def crear_cliente(data_usuario, prioritario):
    usuario = User.objects.create_user(**data_usuario)
    cliente = Cliente.objects.create(ID_Usuario=usuario, prioritario=prioritario)
    return cliente

def actualizar_cliente(cliente_id, data_usuario=None, prioritario=None):
    cliente = Cliente.objects.select_related('ID_Usuario').get(id=cliente_id)
    if data_usuario:
        for key, value in data_usuario.items():
            setattr(cliente.ID_Usuario, key, value)
        cliente.ID_Usuario.save()
    if prioritario is not None:
        cliente.prioritario = prioritario
        cliente.save()
    return cliente

def obtener_cliente_por_cc_o_id(identificador):
    try:
        if isinstance(identificador, int):
            return Cliente.objects.select_related('ID_Usuario').get(ID_Usuario__cc=identificador)
        return Cliente.objects.get(id=identificador)
    except Cliente.DoesNotExist:
        return None


### ========== FUNCIONES DE CONSULTA ==========

def es_cliente_prioritario(cc):
    cliente = obtener_cliente_por_cc_o_id(cc)
    return cliente.prioritario if cliente else None

def cliente_supera_turnos(cc, cantidad):
    cliente = obtener_cliente_por_cc_o_id(cc)
    if not cliente:
        return False
    return Turno.objects.filter(cliente=cliente).count() > cantidad

def obtener_turnos_cliente(cc):
    cliente = obtener_cliente_por_cc_o_id(cc)
    if not cliente:
        return []
    return Turno.objects.filter(cliente=cliente)

def actualizar_password_admin(cc, nueva_password):
    try:
        admin = Administrador.objects.select_related('ID_Usuario').get(ID_Usuario__cc=cc)
        admin.ID_Usuario.password = make_password(nueva_password)
        admin.ID_Usuario.save()
        return True
    except Administrador.DoesNotExist:
        return False

def obtener_tiempos_usuario(cc):
    try:
        user = User.objects.get(cc=cc)
        return {
            "creado": user.created_at,
            "actualizado": user.updated_at
        }
    except User.DoesNotExist:
        return None

def cliente_es_empleado(cc):
    try:
        user = User.objects.get(cc=cc)
        return Empleado.objects.filter(ID_Usuario=user).exists()
    except User.DoesNotExist:
        return False


### ========== FUNCIONES DE ESTADÍSTICAS ==========

def calcular_edad(fecha_nacimiento):
    hoy = date.today()
    return hoy.year - fecha_nacimiento.year - ((hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day))

def contar_clientes_por_edad():
    clientes = Cliente.objects.select_related('ID_Usuario').all()
    menores = sum(1 for c in clientes if calcular_edad(c.ID_Usuario.dob.date()) < 18)
    mayores = len(clientes) - menores
    return {"menores": menores, "mayores": mayores}
### ========== ESTADÍSTICAS DE ADMINISTRADORES ==========
# Cuántos hay.
# Quién es el más recientemente creado.
# Quién es el más antiguo.
def estadisticas_administradores():
    administradores = Administrador.objects.select_related('ID_Usuario').all()
    total = administradores.count()
    if total == 0:
        return {"total": 0, "mas_reciente": None, "mas_antiguo": None}
    mas_reciente = administradores.order_by('-created_at').first().ID_Usuario
    mas_antiguo = administradores.order_by('created_at').first().ID_Usuario
    return {
        "total": total,
        "mas_reciente": f"{mas_reciente.first_name} {mas_reciente.last_name} (CC: {mas_reciente.cc})",
        "mas_antiguo": f"{mas_antiguo.first_name} {mas_antiguo.last_name} (CC: {mas_antiguo.cc})"
    }
### ========== otras ==========
def contar_clientes_activos():
    return Cliente.objects.filter(deleted_at__isnull=True).count()

def contar_empleados_activos():
    return Empleado.objects.filter(deleted_at__isnull=True).count()

def clientes_que_son_empleados():
    clientes = Cliente.objects.select_related('ID_Usuario').all()
    return [c for c in clientes if Empleado.objects.filter(ID_Usuario=c.ID_Usuario).exists()]