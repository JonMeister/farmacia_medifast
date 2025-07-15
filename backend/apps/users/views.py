
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, status

from django.utils.timezone import now
from .models import Cliente, User, Administrador, Empleado, Rol
from .serializers import (cc_client, admin_password, obtener_creacion_actualizacion_cliente, 
                          obtener_creacion_actualizacion_administrador, ClienteSerializer, 
                          UserSerializer, RolSerializer, AdministradorSerializer)
from apps.tickets.models import Turno
from apps.tickets.serializers import Turnos_de_un_cliente

class AdministradorViewSet(viewsets.ModelViewSet):

    queryset = Administrador.objects.filter(deleted_at__isnull = True)
    serializer_class = AdministradorSerializer

class RolViewSet(viewsets.ModelViewSet):

    queryset = Rol.objects.all()
    serializer_class = RolSerializer


class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.filter(deleted_at__isnull = True)
    serializer_class = UserSerializer

    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()
        instance.deleted_at = now()
        instance.is_active = False
        instance.save()
        return Response({'message':'Usuario eliminado'}, status  = status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        from apps.users.models import Cliente, Empleado, Administrador

        data = request.data.copy()

        # Validar rol recibido
        rol_str = data.get("rol")
        if rol_str not in ["cliente", "administrador", "empleado"]:
            return Response({"error": "El rol debe ser 'cliente', 'administrador' o 'empleado'."}, status=400)

        if rol_str == "empleado":
            rol_str = "Empleado"

        # Crear el objeto Rol correspondiente
        rol_data = {"cliente": False, "administrador": False, "Empleado": False}
        rol_data[rol_str] = True
        rol_obj = Rol.objects.create(**rol_data)
        data["rol"] = rol_obj.id

        # Si es cliente, la contraseña será la cédula
        if rol_str == "cliente":
            data["password"] = str(data.get("cc"))

        cc = data.get("cc")

        try:
            usuario_existente = User.objects.get(cc=cc)

            if usuario_existente.deleted_at:
                serializer = self.get_serializer(usuario_existente, data=data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()

                usuario_existente.set_password(data["password"])
                usuario_existente.deleted_at = None 
                usuario_existente.save()

                user = usuario_existente

            else:
                return Response({"error": "Ya existe un usuario activo con esa cédula."}, status=400)

        except User.DoesNotExist:
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            user = User.objects.get(pk=serializer.data["id"])
            user.set_password(serializer.validated_data["password"])
            user.save()

        # Crear entrada en tabla correspondiente
        if rol_str == "cliente":
            Cliente.objects.create(ID_Usuario=user)
        elif rol_str == "Empleado":
            Empleado.objects.create(ID_Usuario=user, Password=user.password)
        elif rol_str == "administrador":
            Administrador.objects.create(ID_Usuario=user, Password=user.password)

        return Response({
            "message": "Usuario creado correctamente",
            "id": user.id,
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class ClienteViewSet(viewsets.ModelViewSet):

    queryset = Cliente.objects.filter(deleted_at__isnull = True)
    serializer_class = ClienteSerializer

    #@action(detail = False, methods = ['get'], url_path = 'all')
    #def all_clients(self,request):

    def destroy(self,request,*args,**kwargs):
        instance = self.get_object()
        instance.deleted_at = now()
        instance.save()
        return Response({'message':'Cliente eliminado'}, status  = status.HTTP_204_NO_CONTENT)
        


    @action(detail = False, methods = ['post'], url_path = 'es_cliente_y_empleado')
    def es_cliente_y_empleado(self,request):

        serializer = cc_client(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']

        try:

            usuario = User.objects.get(cc = cc, deleted_at__isnull = True)

            es_cliente = Cliente.objects.filter(ID_Usuario = usuario, deleted_at__isnull = True).exists()

            es_empleado = Empleado.objects.filter(ID_Usuario = usuario, deleted_at__isnull = True).exists()

            response = es_cliente and es_empleado

            return Response({'cliente_empleado' : response},status = 200)
        
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)

    @action(detail= False, methods= ['post'], url_path= 'creacion_y_actualizacion_administrador')
    def obtener_creacion_y_actualizacion_administrador(self,request):

        serializer = cc_client(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']

        try:
            usuario = User.objects.get(cc = cc, deleted_at__isnull = True)
            administrador = Administrador.objects.get(ID_Usuario=usuario, deleted_at__isnull = True)

            administrador_serializado = obtener_creacion_actualizacion_administrador(data = administrador)

            return Response({'fechas' : administrador_serializado},status = 200)
        
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
        
        except Administrador.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=403) 
        

    @action(detail= False, methods= ['post'], url_path= 'creacion_y_actualizacion_cliente')
    def obtener_creacion_y_actualizacion_clente(self,request):

        serializer = cc_client(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']

        try:
            usuario = User.objects.get(cc = cc, deleted_at__isnull = True)
            cliente = Cliente.objects.get(ID_Usuario=usuario, deleted_at__isnull = True)

            cliente_serializado = obtener_creacion_actualizacion_cliente(data = cliente)

            return Response({'fechas' : cliente_serializado},status = 200)
        
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
        
        except Cliente.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=403) 


    @action(detail = False, methods = ['patch'], url_path = 'cambiar_password')
    def cambiar_password_administrador(self,request):
        
        serializer = admin_password(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']
        n_password = serializer.validated_data['nueva_password']

        try:

            usuario = User.objects.get(cc = cc, deleted_at__isnull = True)
            administrador = Administrador.objects.get(ID_Usuario = usuario, deleted_at__isnull = True)
            # Administrador.objects.get(ID_Usuario=usuario)
            usuario.set_password(n_password)
            usuario.save()

            return Response({'mensaje': 'Contraseña actualizada correctamente'}, status=200)
        
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
        
        except Administrador.DoesNotExist:
            return Response({'error': 'El usuario no es un administrador'}, status=403) 

    @action(detail = False, methods = ['post'], url_path = 'turnos-cliente')
    def turnos_de_un_cliente(self,request):
        serializer = cc_client(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']

        try:

            usuario = User.objects.get(cc=cc, deleted_at__isnull=True)
            cliente = Cliente.objects.get(ID_Usuario=usuario, deleted_at__isnull=True)
            turnos = Turno.objects.filter(ID_Cliente = cliente)

            turnos_serializados = Turnos_de_un_cliente(data = turnos, many = True)

            return Response({'cc' : cc, 'turnos' : turnos_serializados.data},status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Cliente.DoesNotExist:
            return Response({'detail': 'CLiente no encontrado'}, status=status.HTTP_404_NOT_FOUND)   
            

    @action(detail = False, methods = ['post'], url_path = 'cantidad_turnos')
    def cantidad_turnos_cliente(self,request):
        serializer = cc_client(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']

        try:

            usuario = User.objects.get(cc=cc, deleted_at__isnull=True)
            cliente = Cliente.objects.get(ID_Usuario=usuario, deleted_at__isnull=True)
            cantidad_turnos = Turno.objects.filter(ID_Cliente = cliente).count()

            return Response({'cc': cc, 'cantidad_turnos': cantidad_turnos}, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Cliente.DoesNotExist:
            return Response({'detail': 'CLiente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='es-prioritario')
    def es_prioritario(self, request):
        serializer = cc_client(data=request.data)
        serializer.is_valid(raise_exception=True)
        cc = serializer.validated_data['cc']

        try:
            usuario = User.objects.get(cc=cc, deleted_at__isnull=True)
            cliente = Cliente.objects.get(ID_Usuario=usuario, deleted_at__isnull=True)
            return Response({'prioritario': cliente.prioritario}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Cliente.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)


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



{
  "username": "Sarapankekes",
  "password": "PeraPapaya123",
  "first_name": "Sara Manuela",
  "last_name": "Lozada Salamanca",
  "email": "Sarapanks@gmail.com",
  "cc": "100636113",
  "phone_number": "3008473493",
  "dob": "1990-05-15",
  "is_staff": false,
  "is_active": true
}


{
  "administrador":false,
  "cliente":true,
  "Empleado":false
}
"""