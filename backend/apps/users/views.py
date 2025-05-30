from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.dateparse import parse_date
from django.db.models import Q, Count, Min, Max
from datetime import date, datetime
from ..tickets.models import Caja, Turno
from .models import User, Empleado, Rol
from .serializers import UserSerializer, EmpleadoSerializer

"""Funciones para obtener todos los registros de usuarios y empleados"""
class UserListAPIView(APIView):
    def get(self, request):
        users = list(User.objects.values())
        return Response(users)

class EmpleadoListAPIView(APIView):
    def get(self, request):
        empleados = list(Empleado.objects.values())
        return Response(empleados)

"""Funciones para crear usuarios y empleados"""
class UserCreateAPIView(APIView):
    def post(self, request):
        user = User.objects.create(**request.data)
        return Response({"mensaje": "Usuario creado", "usuario_id": user.id}, status=status.HTTP_201_CREATED)
    
class EmpleadoCreateAPIView(APIView):
    def post(self, request):
        empleado = Empleado.objects.create(**request.data)
        return Response({"mensaje": "Empleado creado", "empleado_id": empleado.id}, status=status.HTTP_201_CREATED)

"""Funciones para actualizar usuarios y empleados"""
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

"""Funciones para obtener usuarios y empleados por cédula o id"""
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
        empleado = Empleado.objects.filter(
            Q(id=id) | Q(ID_Usuario__cc=cc)
        ).select_related('ID_Usuario').values().first()
        if empleado:
            return Response(empleado)
        return Response({"error": "Empleado no encontrado"}, status=404)

"""Función para contar cuántos usuarios son empleados"""
class EmpleadosCountAPIView(APIView):
    def get(self, request):
        count = Empleado.objects.count()
        return Response({"cantidad_empleados": count})

"""Función para encontrar empleados que trabajaron en una fecha específica"""
class EmpleadosPorFechaAPIView(APIView):
    def get(self, request):
        fecha = request.query_params.get('fecha')
        empleados = Empleado.objects.filter(fecha_contratacion=fecha).values()
        return Response(empleados)

"""Función para filtrar usuarios y empleados por nombre y apellido"""

class FiltrarUsersEmpleadosNombreApellidoAPIView(APIView):
    def get(self, request):
        nombre = request.query_params.get('nombre', '')
        apellido = request.query_params.get('apellido', '')

        usuarios = User.objects.filter(
            Q(first_name__icontains=nombre) | Q(last_name__icontains=apellido)
        ).values()

        empleados = Empleado.objects.filter(
            Q(ID_Usuario__first_name__icontains=nombre) | Q(ID_Usuario__last_name__icontains=apellido)
        ).select_related('ID_Usuario').values(
            'id', 'ID_Usuario', 'Fecha_contratacion', 'ID_Caja',
            'ID_Usuario__first_name', 'ID_Usuario__last_name'
        )

        return Response({
            "usuarios": list(usuarios),
            "empleados": list(empleados)
        })

"""Función para obtener la fecha de contratación de un empleado dado el id y/o la cédula"""
class FechaContratacionAPIView(APIView):
    def get(self, request):
        id = request.query_params.get('id')
        cc = request.query_params.get('cc')
        empleado = Empleado.objects.filter(
            Q(id=id) | Q(ID_Usuario__cc=cc)
        ).values('Fecha_contratacion').first()
        if empleado:
            return Response(empleado)
        return Response({"error": "Empleado no encontrado"}, status=404)

"""Función para obtener la caja en la que un empleado trabajó en un día específico"""
class CajaPorEmpleadoFechaAPIView(APIView):
    def get(self, request):
        id_empleado = request.query_params.get('id')
        fecha = request.query_params.get('fecha')
        turnos = Turno.objects.filter(
            ID_Caja__Empleado__id=id_empleado,
            create_at__date=parse_date(fecha)
        ).select_related('ID_Caja').values('ID_Caja')
        return Response(turnos)
    
"""Función para encontrar el empleado más viejo y más nuevo"""
class EmpleadoMasAntiguoMasNuevoAPIView(APIView):
    def get(self, request):
        empleado_mas_antiguo = Empleado.objects.order_by('Fecha_contratacion').select_related('ID_Usuario').first()
        empleado_mas_nuevo = Empleado.objects.order_by('-Fecha_contratacion').select_related('ID_Usuario').first()

        return Response({
            "empleado_mas_antiguo": EmpleadoSerializer(empleado_mas_antiguo).data if empleado_mas_antiguo else None,
            "empleado_mas_nuevo": EmpleadoSerializer(empleado_mas_nuevo).data if empleado_mas_nuevo else None
        })
    
"""Función para calcular la edad de un usuario y/o empleado dado el id o la cédula"""
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

"""Función para ver cuales fueron los empleados cuya información fue actualizada después de una fecha dada"""
class EmpleadosActualizadosAPIView(APIView):
    def get(self, request):
        fecha = request.query_params.get('fecha')
        empleados = Empleado.objects.filter(update_at__gt=fecha).values()
        return Response(empleados)

"""Función para obtener fecha y correo de un usuario y/o empleado"""    
class UserFechaCorreoAPIView(APIView):
    def get(self, request):
        id = request.query_params.get('id')
        usuario = User.objects.filter(id=id).values('created_at', 'correo').first()
        if usuario:
            return Response(usuario)
        return Response({"error": "Usuario no encontrado"}, status=404)

"""Función que retorne el rol de un usuario"""
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

"""Funciones que determine todos los usuarios y/o empleados mayores y menores a una edad determinada"""
class UserMenorMayorAPIView(APIView):
    def get(self, request):
        edad_ref = int(request.query_params.get('edad'))
        mayores = []
        menores = []
        hoy = date.today()
        for usuario in User.objects.all():
            if usuario.dob:
                edad = (hoy - usuario.dob).days // 365
                if edad >= edad_ref:
                    mayores.append(usuario.id)
                else:
                    menores.append(usuario.id)
        return Response({"mayores": mayores, "menores": menores})
    
class EmpleadoMenorMayorAPIView(APIView):
    def get(self, request):
        edad_ref = int(request.query_params.get('edad'))
        mayores = []
        menores = []
        hoy = date.today()

        empleados = Empleado.objects.select_related('ID_Usuario').all()

        for empleado in empleados:
            usuario = empleado.ID_Usuario
            if usuario and usuario.dob:
                edad = (hoy - usuario.dob).days // 365
                if edad >= edad_ref:
                    mayores.append(usuario.id)
                else:
                    menores.append(usuario.id)

        return Response({
            "mayores": mayores,
            "menores": menores
        })

"""
from django.shortcuts import render
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.contrib.auth.hashers import make_password
from apps.users.models import User, Caja, Servicio
from apps.users.serializers import UserSerializer, CajaSerializer, ServicioSerializer
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import authenticate

@api_view(['POST'])
def register(request):
            
    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        print(request.data)
        user = User.objects.get(cc=serializer.data['cc'])
        user.set_password(serializer.validated_data['password'])
        user.save()
        print("TIPO LA SIGUIENTE FILA-------------------------")
        print(type(user))
        token = Token.objects.create(user=user)
        return Response({'token':token.key, "user": serializer.data}, status=status.HTTP_201_CREATED)
    
    return Response({})

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    #permission_classes = [IsAuthenticated] 

    def create(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            print(request.data)
            user = User.objects.get(cc=serializer.data['cc'])
            user.set_password(serializer.validated_data['password'])
            user.save()
            token = Token.objects.create(user=user)
            return Response({'token':token.key, "user": serializer.data}, status=status.HTTP_201_CREATED)
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
    

class CustomAuthToken(APIView):
    def post(self, request):
        cc = request.data.get("cc")
        password = request.data.get("password")

        user = authenticate(request, cc=cc, password=password)

        if not user:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)

        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "is_staff": user.is_staff,
            "is_client": user.is_client,
            "is_cajero": user.is_cajero,
            })

       
class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all()
    serializer_class = CajaSerializer
    
    @action(detail=False, methods=['get'])
    def cajeros_disponibles(self, request):
        # Devuelve lista de usuarios que son cajeros y no están asignados a una caja
        cajeros_asignados = Caja.objects.exclude(cajero=None).values_list('cajero', flat=True)
        cajeros_disponibles = User.objects.filter(is_cajero=True).exclude(id__in=cajeros_asignados)
        serializer = UserSerializer(cajeros_disponibles, many=True)
        return Response(serializer.data)

class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

#urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
"""