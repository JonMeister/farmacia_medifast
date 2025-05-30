from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicioViewSet, TurnoViewSet, HorarioViewSet

router = DefaultRouter()
router.register(r'servicios', ServicioViewSet)
router.register(r'turnos', TurnoViewSet)
router.register(r'horarios', HorarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
