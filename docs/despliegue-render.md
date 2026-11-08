# Desplegar NutriBalance en Render

El servicio Docker sirve las páginas y el gateway `/api/v1/*` con Vinext en Node. Las solicitudes del formulario y el panel siguen usando la API Express de `https://api.neadev.com`. La implementación D1 anterior no tiene base de datos en Render.

## Publicación

1. Subí la rama de este proyecto a GitHub. `node_modules`, `dist` y los archivos `.env` están ignorados por Git.
2. En Render, elegí **New > Blueprint** y conectá el repositorio. `render.yaml` crea el servicio `nutribalance-mauricio` con Docker en el plan gratuito.
3. Esperá una respuesta 200 del healthcheck `/api/health` y abrí la URL `.onrender.com` asignada.
4. Verificá la portada, `/solicitar-turno` y `/api/v1/availability?date=AAAA-MM-DD`. Probá el acceso profesional y una solicitud con datos ficticios.

Render asigna `PORT`; la aplicación escucha en `0.0.0.0`. El plan gratuito puede tardar alrededor de un minuto en reactivarse tras 15 minutos sin tráfico.

El gateway comprueba que los `POST` lleguen desde el origen real de la página. Para comunicarse con Express usa `EXPRESS_ALLOWED_ORIGIN`, configurado con el origen de NutriBalance ya autorizado por el backend. Las contraseñas profesionales se ingresan en el formulario y no se guardan en Render.

Render define `RENDER_EXTERNAL_URL` para el sitemap y los metadatos. Para un dominio propio, configurá `PUBLIC_SITE_ORIGIN` con su origen HTTPS completo y agregá el dominio en Render.

## Verificación local

```sh
docker build -t nutribalance-render .
docker run --rm -p 10000:10000 -e EXPRESS_ALLOWED_ORIGIN=https://nutribalance-mauricio.maauri.chatgpt.site nutribalance-render
```

También podés probar el servidor Node sin Docker:

```sh
RENDER_DEPLOY=1 pnpm run build:render
PORT=10000 HOST=0.0.0.0 pnpm run start:render
```

En PowerShell, establecé las variables con `$env:RENDER_DEPLOY='1'`, `$env:PORT='10000'` y `$env:HOST='0.0.0.0'` antes de ejecutar los comandos. Se requiere Node.js 22.13 o superior y pnpm 11.25.0.
