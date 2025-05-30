
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import (
    contar_clientes_activos,
    contar_empleados_activos,
    es_cliente_prioritario,
    cliente_supera_turnos,
    obtener_turnos_cliente,
    actualizar_password_admin,
    obtener_tiempos_usuario,
    cliente_es_empleado,
    clientes_que_son_empleados,
)
from .models import Cliente
from apps.users.serializers import UserSerializer
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