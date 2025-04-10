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
from apps.users.views import (UserViewSet,CajeroViewSet)
from apps.tickets.views import (UsuarioEsperaViewSet,CajeroUsuarioEsperaViewSet)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users',UserViewSet)
router.register(r'usuarios-espera', UsuarioEsperaViewSet, basename="usuario-espera")
router.register(r'cajeros', CajeroViewSet)
router.register(r'cajeros-usuarios-espera', CajeroUsuarioEsperaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
