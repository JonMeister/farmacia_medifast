from django.apps import AppConfig


class TicketsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.tickets'

    def ready(self):
        from django.db.utils import OperationalError, ProgrammingError
        from .signals import create_default_client
