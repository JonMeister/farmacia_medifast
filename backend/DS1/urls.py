"""
URL configuration for DS1 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from .views import (UserListAPIView,EmpleadoListAPIView,UserCreateAPIView,EmpleadoCreateAPIView,UserUpdateAPIView,EmpleadoUpdateAPIView,UserRetrieveAPIView,
    EmpleadoRetrieveAPIView,EmpleadosCountAPIView,EmpleadosPorFechaAPIView,FiltrarUsersEmpleadosNombreApellidoAPIView,FechaContratacionAPIView,CajaPorEmpleadoFechaAPIView,
    EmpleadoMasAntiguoMasNuevoAPIView,EdadUserAPIView,EmpleadosActualizadosAPIView,UserFechaCorreoAPIView,UserRolAPIView,UserMenorMayorAPIView,EmpleadoMenorMayorAPIView
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

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tickets/', include('apps.tickets.urls')),
    #path('api/users/', include('apps.users.urls')),
    #path('api/products/', include('apps.products.urls')),
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
]

