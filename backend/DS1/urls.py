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
from django.urls import path, include, re_path
from apps.users.views import ClienteViewSet, UserViewSet, RolViewSet, AdministradorViewSet
#from apps.users.views import (UserViewSet,CajaViewSet, CustomAuthToken, ServicioViewSet)
#from apps.tickets.views import (UsuarioEsperaViewSet,CajeroUsuarioEsperaViewSet)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users',UserViewSet, basename="usuario")
router.register(r'clients', ClienteViewSet, basename="cliente")
router.register(r'rol', RolViewSet, basename="rol")
router.register(r'u_admin',AdministradorViewSet, basename = "user_admin")
#router.register(r'usuarios-espera', UsuarioEsperaViewSet, basename="usuario-espera")
#router.register(r'cajas', CajaViewSet)
#router.register(r'servicios', ServicioViewSet)
#router.register(r'cajeros-usuarios-espera', CajeroUsuarioEsperaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    #path('api/authtoken', CustomAuthToken.as_view())

]
