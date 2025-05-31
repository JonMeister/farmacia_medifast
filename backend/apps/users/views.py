from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view
from rest_framework.authtoken.models import Token
from django.utils.dateparse import parse_date
from django.db.models import Q, Count
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from datetime import date

# Modelos de users
from apps.users.models import (
    User, Empleado, Rol, Cliente
)

# Serializers de users
from apps.users.serializers import (
    UserSerializer, EmpleadoSerializer
)

from apps.users.services import (
    contar_clientes_activos, contar_empleados_activos, es_cliente_prioritario,
    cliente_supera_turnos, obtener_turnos_cliente, actualizar_password_admin,
    obtener_tiempos_usuario, cliente_es_empleado, clientes_que_son_empleados
)

# Imports de Django y DRF
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view
from rest_framework.authtoken.models import Token
from django.utils.dateparse import parse_date
from django.db.models import Q, Count
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from datetime import date

# Imports necesarios de tickets
from apps.tickets.models import Turno

# Serializers de tickets
from apps.tickets.serializers import (
    CajaSerializer, ServicioSerializer
)

from apps.users.services import (
    contar_clientes_activos, contar_empleados_activos, es_cliente_prioritario,
    cliente_supera_turnos, obtener_turnos_cliente, actualizar_password_admin,
    obtener_tiempos_usuario, cliente_es_empleado, clientes_que_son_empleados
)


# --- Funciones relacionadas con Clientes, Turnos y Administradores ---

class ContarClientesActivosView(APIView):
    def get(self, request):
        total = contar_clientes_activos()
        return Response({'total_clientes_activos': total})


class ContarEmpleadosActivosView(APIView):
    def get(self, request):
        total = contar_empleados_activos()
        return Response({'total_empleados_activos': total})


class PrioritarioClienteView(APIView):
    def get(self, request, cc):
        resultado = es_cliente_prioritario(cc)
        if resultado is None:
            return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'prioritario': resultado})


class ClienteSuperaTurnosView(APIView):
    def get(self, request, cc, cantidad):
        resultado = cliente_supera_turnos(cc, int(cantidad))
        return Response({'supera_turnos': resultado})


class TurnosClienteView(APIView):
    def get(self, request, cc):
        turnos = obtener_turnos_cliente(cc)
        data = [{'id': t.id, 'fecha': t.fecha} for t in turnos]
        return Response(data)


class ActualizarPasswordAdminView(APIView):
    def post(self, request, cc):
        nueva_password = request.data.get('nueva_password')
        if not nueva_password:
            return Response({'error': 'Debe enviar nueva_password'}, status=status.HTTP_400_BAD_REQUEST)
        resultado = actualizar_password_admin(cc, nueva_password)
        if not resultado:
            return Response({'error': 'Administrador no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'mensaje': 'Contraseña actualizada correctamente'})


class TiemposUsuarioView(APIView):
    def get(self, request, cc):
        tiempos = obtener_tiempos_usuario(cc)
        if tiempos is None:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(tiempos)


class ClienteEsEmpleadoView(APIView):
    def get(self, request, cc):
        es_empleado = cliente_es_empleado(cc)
        return Response({'es_empleado': es_empleado})


class ClienteDetailView(APIView):
    def get(self, request, cc):
        cliente = Cliente.objects.filter(ID_Usuario__cc=cc).first()
        if not cliente:
            return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(cliente)
        return Response(serializer.data)


class ClientesQueSonEmpleadosView(APIView):
    def get(self, request):
        clientes = clientes_que_son_empleados()
        serializer = UserSerializer(clientes, many=True)
        return Response(serializer.data)


# --- CRUD Usuarios y Empleados ---

class UserListAPIView(APIView):
    def get(self, request):
        users = list(User.objects.values())
        return Response(users)


class EmpleadoListAPIView(APIView):
    def get(self, request):
        empleados = list(Empleado.objects.values())
        return Response(empleados)


class UserCreateAPIView(APIView):
    def post(self, request):
        user = User.objects.create(**request.data)
        return Response({"mensaje": "Usuario creado", "usuario_id": user.id}, status=status.HTTP_201_CREATED)


class EmpleadoCreateAPIView(APIView):
    def post(self, request):
        empleado = Empleado.objects.create(**request.data)
        return Response({"mensaje": "Empleado creado", "empleado_id": empleado.id}, status=status.HTTP_201_CREATED)


class EmpleadoUpdateAPIView(APIView):
    def put(self, request, pk):
        try:
            empleado = Empleado.objects.get(pk=pk)
            for campo, valor in request.data.items():
                setattr(empleado, campo, valor)
            empleado.save()
            return Response({"mensaje": "Empleado actualizado"})
        except Empleado.DoesNotExist:
            return Response({"error": "Empleado no encontrado"}, status=404)


class UserUpdateAPIView(APIView):
    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            for campo, valor in request.data.items():
                setattr(user, campo, valor)
            user.save()
            return Response({"mensaje": "Usuario actualizado"})
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)


# --- Otras funcionalidades útiles ---

class UserRetrieveAPIView(APIView):
    def get(self, request):
        id = request.query_params.get('id')
        cc = request.query_params.get('cc')
        user = User.objects.filter(Q(id=id) | Q(cc=cc)).values().first()
        if user:
            return Response(user)
        return Response({"error": "User no encontrado"}, status=404)


class EmpleadoRetrieveAPIView(APIView):
    def get(self, request):
        id = request.query_params.get('id')
        cc = request.query_params.get('cc')
        empleado = Empleado.objects.filter(Q(id=id) | Q(ID_Usuario__cc=cc)).values().first()
        if empleado:
            return Response(empleado)
        return Response({"error": "Empleado no encontrado"}, status=404)


class EmpleadosCountAPIView(APIView):
    def get(self, request):
        count = Empleado.objects.count()
        return Response({"cantidad_empleados": count})


class EmpleadosPorFechaAPIView(APIView):
    def get(self, request):
        fecha = request.query_params.get('fecha')
        empleados = Empleado.objects.filter(fecha_contratacion=fecha).values()
        return Response(empleados)


class FiltrarUsersEmpleadosNombreApellidoAPIView(APIView):
    def get(self, request):
        nombre = request.query_params.get('nombre', '')
        apellido = request.query_params.get('apellido', '')
        usuarios = User.objects.filter(Q(first_name__icontains=nombre) | Q(last_name__icontains=apellido)).values()
        empleados = Empleado.objects.filter(
            Q(ID_Usuario__first_name__icontains=nombre) | Q(ID_Usuario__last_name__icontains=apellido)
        ).values(
            'id', 'ID_Usuario', 'Fecha_contratacion', 'ID_Caja',
            'ID_Usuario__first_name', 'ID_Usuario__last_name'
        )
        return Response({"usuarios": list(usuarios), "empleados": list(empleados)})


class FechaContratacionAPIView(APIView):
    def get(self, request):
        id = request.query_params.get('id')
        cc = request.query_params.get('cc')
        empleado = Empleado.objects.filter(Q(id=id) | Q(ID_Usuario__cc=cc)).values('Fecha_contratacion').first()
        if empleado:
            return Response(empleado)
        return Response({"error": "Empleado no encontrado"}, status=404)


class CajaPorEmpleadoFechaAPIView(APIView):
    def get(self, request):
        id_empleado = request.query_params.get('id')
        fecha = request.query_params.get('fecha')
        turnos = Turno.objects.filter(
            ID_Caja__Empleado__id=id_empleado,
            create_at__date=parse_date(fecha)
        ).values('ID_Caja')
        return Response(turnos)


class EmpleadoMasAntiguoMasNuevoAPIView(APIView):
    def get(self, request):
        antiguo = Empleado.objects.order_by('Fecha_contratacion').first()
        nuevo = Empleado.objects.order_by('-Fecha_contratacion').first()
        return Response({
            "empleado_mas_antiguo": EmpleadoSerializer(antiguo).data if antiguo else None,
            "empleado_mas_nuevo": EmpleadoSerializer(nuevo).data if nuevo else None
        })


class EdadUserAPIView(APIView):
    def get(self, request):
        id_usuario = request.query_params.get("id")
        cc = request.query_params.get("cc")
        try:
            usuario = User.objects.get(id=id_usuario) if id_usuario else User.objects.get(cc=cc)
            today = date.today()
            edad = today.year - usuario.dob.year - ((today.month, today.day) < (usuario.dob.month, usuario.dob.day))
            return Response({"edad": edad})
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)


class EmpleadosActualizadosAPIView(APIView):
    def get(self, request):
        fecha = request.query_params.get('fecha')
        empleados = Empleado.objects.filter(update_at__gt=fecha).values()
        return Response(empleados)


class UserFechaCorreoAPIView(APIView):
    def get(self, request):
        id = request.query_params.get('id')
        usuario = User.objects.filter(id=id).values('created_at', 'correo').first()
        if usuario:
            return Response(usuario)
        return Response({"error": "Usuario no encontrado"}, status=404)


class UserRolAPIView(APIView):
    def get(self, request):
        id = request.query_params.get('id')
        usuario = User.objects.filter(id=id).select_related('rol').first()
        if usuario and usuario.rol:
            rol = {
                "Administrador": usuario.rol.administrador,
                "Cliente": usuario.rol.cliente,
                "Empleado": usuario.rol.Empleado
            }
            return Response(rol)
        return Response({"error": "Rol no encontrado"}, status=404)


class UserMenorMayorAPIView(APIView):
    def get(self, request):
        edad_ref = int(request.query_params.get('edad'))
        mayores, menores = [], []
        hoy = date.today()
        for usuario in User.objects.all():
            if usuario.dob:
                edad = (hoy - usuario.dob).days // 365
                (mayores if edad >= edad_ref else menores).append(usuario.id)
        return Response({"mayores": mayores, "menores": menores})


class EmpleadoMenorMayorAPIView(APIView):
    def get(self, request):
        edad_ref = int(request.query_params.get('edad'))
        mayores, menores = [], []
        hoy = date.today()
        for empleado in Empleado.objects.select_related('ID_Usuario').all():
            if empleado.ID_Usuario and empleado.ID_Usuario.dob:
                edad = (hoy - empleado.ID_Usuario.dob).days // 365
                (mayores if edad >= edad_ref else menores).append(empleado.ID_Usuario.id)
        return Response({"mayores": mayores, "menores": menores})


# --- Autenticación y Registro ---

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(cc=serializer.data['cc'])
        user.set_password(serializer.validated_data['password'])
        user.save()
        token = Token.objects.create(user=user)
        return Response({'token': token.key, "user": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomAuthToken(APIView):
    def post(self, request):
        cc = request.data.get("cc")
        password = request.data.get("password")
        user = authenticate(request, cc=cc, password=password)
        if not user:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "is_staff": user.is_staff,
            "is_client": user.is_client,
            "is_cajero": user.is_cajero,
        })


# --- ViewSets para entidades ---

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user = User.objects.get(cc=serializer.data['cc'])
            user.set_password(serializer.validated_data['password'])
            user.save()
            token = Token.objects.create(user=user)
            return Response({'token': token.key, "user": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        if "password" in data:
            data["password"] = make_password(data["password"])
        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({"message": "Usuario desactivado"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        instance = self.get_object()
        instance.is_active = True
        instance.save()
        return Response({"message": "Usuario activado"}, status=status.HTTP_200_OK)
