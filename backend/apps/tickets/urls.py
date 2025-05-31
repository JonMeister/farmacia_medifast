from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicioViewSet, TurnoViewSet, HorarioViewSet, CajaViewSet

router = DefaultRouter()
router.register(r'servicios', ServicioViewSet)
router.register(r'turnos', TurnoViewSet)
router.register(r'horarios', HorarioViewSet)
router.register(r'cajas', CajaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
