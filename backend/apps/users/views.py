
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, status
from django.db import transaction
from django.contrib.auth.hashers import check_password

from django.utils.timezone import now
from .models import Cliente, User, Administrador, Empleado, Rol
from .serializers import (cc_client, admin_password, obtener_creacion_actualizacion_cliente, 
                          obtener_creacion_actualizacion_administrador, ClienteSerializer, 
                          UserSerializer, RolSerializer, AdministradorSerializer, EmpleadoSerializer)
from apps.tickets.models import Turno

class EmpleadoViewSet(viewsets.ModelViewSet):
    
    queryset = Empleado.objects.filter(deleted_at__isnull = True)
    serializer_class = EmpleadoSerializer

    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()
        instance.deleted_at = now()
        instance.is_active = False
        instance.save()
        return Response({'message':'Empleado eliminado'}, status  = status.HTTP_204_NO_CONTENT)

class AdministradorViewSet(viewsets.ModelViewSet):

    queryset = Administrador.objects.filter(deleted_at__isnull = True)
    serializer_class = AdministradorSerializer

    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()
        instance.deleted_at = now()
        instance.is_active = False
        instance.save()
        return Response({'message':'Administrador eliminado'}, status  = status.HTTP_204_NO_CONTENT)

    @action(detail= False, methods= ['post'], url_path= 'creacion_y_actualizacion_administrador')
    def obtener_creacion_y_actualizacion_administrador(self,request):

        serializer = cc_client(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']

        try:
            usuario = User.objects.get(cc = cc, deleted_at__isnull = True)
            administrador = Administrador.objects.get(ID_Usuario=usuario, deleted_at__isnull = True)

            administrador_serializado = obtener_creacion_actualizacion_administrador(administrador)

            return Response({'fechas' : administrador_serializado.data},status = 200)
        
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
        
        except Administrador.DoesNotExist:
            return Response({'error': 'Administrador no encontrado'}, status=403) 
    
    @action(detail = False, methods = ['patch'], url_path = 'cambiar_password')
    def cambiar_password_administrador(self,request):
        
        serializer = admin_password(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']
        n_password = serializer.validated_data['nueva_password']
        v_password = serializer.validated_data['antigua_password']

        try:

            usuario = User.objects.get(cc = cc, deleted_at__isnull = True)
            administrador = Administrador.objects.get(ID_Usuario = usuario, deleted_at__isnull = True)
            # Administrador.objects.get(ID_Usuario=usuario)
            print(v_password, usuario.password)
            if check_password(v_password,usuario.password): #v_password == usuario.password:
                usuario.set_password(n_password)
                usuario.save()

                return Response({'mensaje': 'Contraseña actualizada correctamente'}, status=200)
            else:

                return Response({'error': 'Contraseña incorrecta'}, status=401) # ver protocolo

        
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
        
        except Administrador.DoesNotExist:
            return Response({'error': 'El usuario no es un administrador'}, status=403) 
        

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
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()

        rol = instance.rol

        # Cliente no puede cambiar contraseña
        if rol.cliente:
            if "password" in data:
                raise ValidationError({"error": "Los clientes no pueden cambiar su contraseña."})

        # Empleado o administrador puede cambiar, pero con verificación de contraseña antigua
        elif rol.administrador or rol.Empleado:
            nueva_password = data.get("password")
            antigua_password = data.get("old_password")

            if nueva_password:
                if not antigua_password:
                    raise ValidationError({"error": "Debe proporcionar la contraseña actual para cambiarla."})

                if not instance.check_password(antigua_password):
                    raise ValidationError({"error": "La contraseña actual es incorrecta."})

                instance.set_password(nueva_password)
                instance.save()
                data.pop("password")  # Para que no intente reconfigurarla vía serializer
                data.pop("old_password", None)

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        from apps.users.models import Cliente, Empleado, Administrador

        data = request.data.copy()

        user = data.get("user")

        # Validar rol recibido
        rol_str = user.get("rol")
        if rol_str not in ["cliente", "administrador", "empleado"]:
            return Response({"error": "El rol debe ser 'cliente', 'administrador' o 'empleado'."}, status=400)

        if rol_str == "empleado":
            rol_str = "Empleado"

        # Crear el objeto Rol correspondiente
        with transaction.atomic():
            rol_data = {"cliente": False, "administrador": False, "Empleado": False}
            rol_data[rol_str] = True
            rol_obj = Rol.objects.create(**rol_data)
            user["rol"] = rol_obj.id

            # Si es cliente, la contraseña será la cédula
            if rol_str == "cliente":
                user["password"] = str(user.get("cc"))

            cc = user.get("cc")

            try:
                usuario_existente = User.objects.get(cc=cc)

                if usuario_existente.deleted_at:
                    serializer = UserSerializer(data=user)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()

                    usuario_existente.set_password(user["password"])
                    usuario_existente.deleted_at = None 
                    usuario_existente.save()

                    user = usuario_existente

                else:
                    return Response({"error": "Ya existe un usuario activo con esa cédula."}, status=400)

            except User.DoesNotExist:
                serializer = UserSerializer(data=user)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)

                user = User.objects.get(pk=serializer.data["id"])
                user.set_password(serializer.validated_data["password"])
                user.save()

            # Crear entrada en tabla correspondiente
            if rol_str == "cliente":
                prioridad = data.get("aditional").get("prioritario")
                Cliente.objects.create(ID_Usuario=user, prioritario = prioridad)
            elif rol_str == "Empleado":
                fecha = data.get("aditional").get("fecha_contratacion")
                id_caja = data.get("aditional").get("caja")
                Empleado.objects.create(ID_Usuario=user, Fecha_contratacion = fecha, ID_Caja = id_caja)
            elif rol_str == "administrador":
                Administrador.objects.create(ID_Usuario=user)

            return Response({
                "message": "Usuario creado correctamente",
                "id": user.id,
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        

class ClienteViewSet(viewsets.ModelViewSet):

    queryset = Cliente.objects.filter(deleted_at__isnull = True)
    serializer_class = ClienteSerializer

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

            return Response({'cliente_empleado' : response, "nombre" : usuario.first_name,
                             "apellido" : usuario.last_name, "cc": usuario.cc
                             },status = 200)
        
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
        

    @action(detail= False, methods= ['post'], url_path= 'creacion_y_actualizacion_cliente')
    def obtener_creacion_y_actualizacion_clente(self,request):

        serializer = cc_client(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']
        print(cc)

        try:
            usuario = User.objects.get(cc = cc, deleted_at__isnull = True)
            cliente = Cliente.objects.get(ID_Usuario=usuario, deleted_at__isnull = True)

            cliente_serializado = obtener_creacion_actualizacion_cliente(cliente)

            return Response({'fechas' : cliente_serializado.data},status = 200)
        
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)
        
        except Cliente.DoesNotExist:
            return Response({'error': 'Cliente no encontrado'}, status=403) 


    @action(detail = False, methods = ['post'], url_path = 'turnos_cliente')
    def turnos_de_un_cliente(self,request):
        serializer = cc_client(data = request.data)
        serializer.is_valid(raise_exception = True)

        cc = serializer.validated_data['cc']

        try:

            usuario = User.objects.get(cc=cc, deleted_at__isnull=True)
            cliente = Cliente.objects.get(ID_Usuario=usuario, deleted_at__isnull=True)
            turnos = Turno.objects.filter(ID_Cliente = cliente)

            turnos_serializados = Turnos_de_un_cliente(instance = turnos, many = True)

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

    @action(detail=False, methods=['post'], url_path='es_prioritario')
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

{
  "ID_Usuario": 2,
  "prioritario": false
}


{
  "user": {
    "first_name": "Carlos",
    "last_name": "Ramírez",
    "email": "carlos.ramirez@example.com",
    "cc": "123456789",
    "phone_number": "3001234567",
    "dob": "1990-01-01",
    "rol": "empleado",
    "is_staff": false,
    "is_active": true,
    "password": "claveSegura123"
  },
  "aditional": {
    "fecha_contratacion": "2023-05-20"
  }
}

{
  "user": {
    "first_name": "wegwe",
    "last_name": "Cwefmreews",
    "email": "lwro.cawrdero@example.com",
    "cc": "233186189",
    "phone_number": "3208231367",
    "dob": "1990-01-01",
    "rol": "empleado",
    "is_staff": false,
    "is_active": true,
    "password": "claveSegura123"
  },
  "aditional": {
    "fecha_contratacion": "2000-02-03",
    "caja": 1
  }
}

{
  "user": {
    "first_name": "jorge",
    "last_name": "nitales",
    "email": "jorge.nitales@example.com",
    "cc": "232085179",
    "phone_number": "3158738367",
    "dob": "2000-07-17",
    "rol": "administrador",
    "is_staff": false,
    "is_active": true,
    "password": "amoamispapas11"
  },
  "aditional": {
  }
}

{
  "cc":"232085179",
  "nueva_password":"pote1234",
  "antigua_password":"pinito"
}

"""