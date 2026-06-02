# Sistema de Gestion de Citas Medicas

## Estructura

- `frontend/`: interfaz web con Bootstrap 5 y JavaScript puro.
- `clientes/`: microservicio de clientes en el puerto 3000.
- `citas/`: microservicio de citas en el puerto 3001.
- `facturacion/`: microservicio de facturacion en el puerto 3002.

## Como arrancar el sistema

1. Instala Node.js 18 o superior.
2. Abre una terminal PowerShell en la carpeta raiz del proyecto.
3. Instala las dependencias de cada microservicio:
   - `cd clientes` y luego `cmd /c npm install`
   - `cd ..\\citas` y luego `cmd /c npm install`
   - `cd ..\\facturacion` y luego `cmd /c npm install`
4. Inicia cada backend en una terminal separada:
   - `cd clientes` y luego `cmd /c npm start`
   - `cd ..\\citas` y luego `cmd /c npm start`
   - `cd ..\\facturacion` y luego `cmd /c npm start`
5. Abre `frontend/index.html` en el navegador.

Si quieres probarlo desde Visual Studio Code, puedes dejar los tres servidores corriendo y abrir el archivo HTML con Live Server o directamente en el navegador.

## Como funciona

El sistema esta dividido en tres microservicios independientes:

- El servicio de clientes guarda y administra pacientes en `clientes.json`.
- El servicio de citas guarda las citas en `citas.json` y valida que el cliente exista antes de crear o actualizar una cita.
- El servicio de facturacion guarda las facturas en `facturacion.json` y valida que la factura quede asociada a una cita existente.

El frontend consume esas APIs con `fetch()`:

- `http://localhost:3000` para clientes.
- `http://localhost:3001` para citas.
- `http://localhost:3002` para facturacion.

Cuando registras, editas o eliminas un dato desde la interfaz, el navegador envia una peticion HTTP al microservicio correspondiente. Ese microservicio responde con JSON y actualiza su archivo local. Luego el frontend vuelve a consultar los servicios para refrescar las tablas sin recargar la pagina.

## Comunicacion entre frontend y microservicios

Cada microservicio tiene CORS habilitado para permitir peticiones desde el frontend, aunque este se abra en un origen distinto. Eso evita bloqueos del navegador y permite que la comunicacion sea directa entre la interfaz y cada API REST.