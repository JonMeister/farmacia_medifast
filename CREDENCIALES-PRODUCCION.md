# Credenciales de Producción - Farmacia MediFast

## URLs de Producción

- **Backend (Django):** https://farmacia-medifast.onrender.com
- **Frontend (React):** https://farmacia-django-react.vercel.app
- **API Base URL:** https://farmacia-medifast.onrender.com/api

## Credenciales del Superusuario

**Para acceder como administrador al sistema:**

- **CC (Número de identificación):** `123456`
- **Contraseña:** `Admin1234*`
- **Email:** `admin@farmacia.com`
- **Rol:** Administrador
- **Nombre:** Administrador Sistema

## Credenciales de Base de Datos (PostgreSQL en Render)

- **Host:** `dpg-ctmf8456l47c73ffn7l0-a.oregon-postgres.render.com`
- **Database:** `medifastdb`
- **User:** `medifastdb_user`
- **Port:** `5432`
- **Password:** Configurada en variables de entorno de Render

## Estado del Despliegue

### ✅ Backend (Render)
- Despliegue exitoso en Render
- Base de datos PostgreSQL configurada
- Migraciones ejecutadas correctamente
- Superusuario creado automáticamente
- CORS configurado para Vercel
- Variables de entorno configuradas

### ✅ Frontend (Vercel)
- Despliegue exitoso en Vercel
- Variable `VITE_API_BASE_URL` configurada correctamente
- Conexión al backend funcionando
- Detección automática de framework Vite

### ✅ Conectividad
- CORS configurado correctamente
- Requests OPTIONS funcionando (200)
- Login testeado exitosamente via curl
- URLs de API corregidas para incluir `/api`

## Comandos de Verificación

### Verificar Backend
```bash
curl -X GET https://farmacia-medifast.onrender.com/api/users/
```

### Verificar Login
```bash
curl -X POST https://farmacia-medifast.onrender.com/api/authtoken/ \
  -H "Content-Type: application/json" \
  -d '{"cc": 123456, "password": "Admin1234*"}'
```

### Verificar Frontend
- Acceder a: https://farmacia-django-react.vercel.app
- Login con las credenciales del superusuario

## Próximos Pasos

1. ✅ Verificar login completo en el frontend
2. ✅ Probar todas las funcionalidades principales
3. ⏳ Testing de roles (cliente, cajero, administrador)
4. ⏳ Verificar flujo completo de turnos y facturación
5. ⏳ Documentación de usuario final

## Notas Importantes

- El superusuario se crea automáticamente en cada build
- Las migraciones se ejecutan automáticamente en cada deploy
- La base de datos persiste entre deployments
- Los logs están disponibles en el dashboard de Render
- El frontend se redeploya automáticamente con cada push a la rama `production`

## Solución de Problemas

### Si el login no funciona:
1. Verificar que las credenciales sean exactas (CC: 123456, Password: Admin1234*)
2. Verificar la URL base en las variables de entorno
3. Revisar los logs de Render para errores del backend
4. Verificar conectividad con curl

### Si hay errores de CORS:
1. Verificar que la URL del frontend esté en CORS_ALLOWED_ORIGINS
2. Verificar las variables de entorno en Render
3. Revisar los headers de las requests

---
*Última actualización: $(date)*
*Estado: ✅ Despliegue completado y funcional*
