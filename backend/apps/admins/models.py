from django.contrib import admin
from apps.users.models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ('id','username','first_name','last_name','email','cc','phone_number','is_staff','is_active','date_joined')
    search_fields = ('username','first_name','last_name','email','cc','phone_number')
    list_filter = ('is_staff','is_active','date_joined')
    fieldsets = (
        ('Información Personal', {
            'fields': ('first_name','last_name','dob','email','cc','phone_number')
        }),
        ('Permisos', {
            'fields': ('is_staff','is_active')
        }),
    )

admin.site.register(User, UserAdmin)
