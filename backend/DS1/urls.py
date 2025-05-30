# DS1/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from apps.users.views import (
    # ViewSets
    UserViewSet, CajaViewSet, ServicioViewSet,

    # Funcionales
    ContarClientesActivosView, ContarEmpleadosActivosView,
    PrioritarioClienteView, ClienteSuperaTurnosView, TurnosClienteView,
    ActualizarPasswordAdminView, TiemposUsuarioView, ClienteEsEmpleadoView,
    ClienteDetailView, ClientesQueSonEmpleadosView,

    # CRUD y filtros
    UserListAPIView, EmpleadoListAPIView, UserCreateAPIView, EmpleadoCreateAPIView,
    UserUpdateAPIView, EmpleadoUpdateAPIView, UserRetrieveAPIView, EmpleadoRetrieveAPIView,
    EmpleadosCountAPIView, EmpleadosPorFechaAPIView, FiltrarUsersEmpleadosNombreApellidoAPIView,
    FechaContratacionAPIView, CajaPorEmpleadoFechaAPIView, EmpleadoMasAntiguoMasNuevoAPIView,
    EdadUserAPIView, EmpleadosActualizadosAPIView, UserFechaCorreoAPIView, UserRolAPIView,
    UserMenorMayorAPIView, EmpleadoMenorMayorAPIView,

    # Auth
    register, CustomAuthToken
)

schema_view = get_schema_view(
    openapi.Info(
        title="Farmacia API",
        default_version='v1',
        description="API para el sistema de farmacia",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@farmacia.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# ViewSets
router = DefaultRouter()
router.register(r'backend/api/users/usuarios-model', UserViewSet)
router.register(r'backend/api/users/cajas', CajaViewSet)
router.register(r'backend/api/users/servicios', ServicioViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tickets/', include('apps.tickets.urls')),

    # Auth
    path('backend/api/users/auth/register/', register),
    path('backend/api/users/auth/login/', CustomAuthToken.as_view()),

    # Clientes y empleados: funcionales
    path('backend/api/users/clientes/activos/', ContarClientesActivosView.as_view()),
    path('backend/api/users/empleados/activos/', ContarEmpleadosActivosView.as_view()),
    path('backend/api/users/clientes/<str:cc>/prioritario/', PrioritarioClienteView.as_view()),
    path('backend/api/users/clientes/<str:cc>/supera_turnos/<int:cantidad>/', ClienteSuperaTurnosView.as_view()),
    path('backend/api/users/clientes/<str:cc>/turnos/', TurnosClienteView.as_view()),
    path('backend/api/users/admin/<str:cc>/actualizar_password/', ActualizarPasswordAdminView.as_view()),
    path('backend/api/users/usuarios/<str:cc>/tiempos/', TiemposUsuarioView.as_view()),
    path('backend/api/users/clientes/<str:cc>/es_empleado/', ClienteEsEmpleadoView.as_view()),
    path('backend/api/users/clientes/<str:cc>/', ClienteDetailView.as_view()),
    path('backend/api/users/clientes/son_empleados/', ClientesQueSonEmpleadosView.as_view()),

    # CRUD y consultas
    path('backend/api/users/usuarios/', UserListAPIView.as_view()),
    path('backend/api/users/empleados/', EmpleadoListAPIView.as_view()),
    path('backend/api/users/usuarios/create/', UserCreateAPIView.as_view()),
    path('backend/api/users/empleados/create/', EmpleadoCreateAPIView.as_view()),
    path('backend/api/users/usuarios/update/<int:pk>/', UserUpdateAPIView.as_view()),
    path('backend/api/users/empleados/update/<int:pk>/', EmpleadoUpdateAPIView.as_view()),
    path('backend/api/users/usuarios/retrieve/', UserRetrieveAPIView.as_view()),
    path('backend/api/users/empleados/retrieve/', EmpleadoRetrieveAPIView.as_view()),
    path('backend/api/users/empleados/count/', EmpleadosCountAPIView.as_view()),
    path('backend/api/users/empleados/por_fecha/', EmpleadosPorFechaAPIView.as_view()),
    path('backend/api/users/usuarios_empleados_filtrar_nombre_apellido/', FiltrarUsersEmpleadosNombreApellidoAPIView.as_view()),
    path('backend/api/users/empleados/fecha_contratacion/', FechaContratacionAPIView.as_view()),
    path('backend/api/users/empleados/caja_por_fecha/', CajaPorEmpleadoFechaAPIView.as_view()),
    path('backend/api/users/empleados/mas_antiguo_mas_nuevo/', EmpleadoMasAntiguoMasNuevoAPIView.as_view()),
    path('backend/api/users/usuarios/edad/', EdadUserAPIView.as_view()),
    path('backend/api/users/empleados/actualizados_despues_de_fecha/', EmpleadosActualizadosAPIView.as_view()),
    path('backend/api/users/usuarios/fecha_correo/', UserFechaCorreoAPIView.as_view()),
    path('backend/api/users/usuarios/rol/', UserRolAPIView.as_view()),
    path('backend/api/users/usuarios/menores_mayores/', UserMenorMayorAPIView.as_view()),
    path('backend/api/users/empleados/menores_mayores/', EmpleadoMenorMayorAPIView.as_view()),

    # Swagger
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]

# Añadir URLs de router (ViewSets)
urlpatterns += router.urls
