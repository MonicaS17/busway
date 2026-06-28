# Guía de Conexión de la API en el Entorno Móvil (Expo)

Esta guía explica detalladamente cómo conectar la aplicación móvil (**Expo**) con el servidor backend (**API**) que se ejecuta localmente en tu computadora o en diferentes computadoras de la red local. 

Esto es fundamental para que funciones como el módulo de **Viajes (GPS, Sockets, etc.)** funcionen correctamente en dispositivos físicos (Android/iOS) y emuladores.

---

## 📌 ¿Por qué no podemos usar `localhost` o `127.0.0.1`?

En el desarrollo móvil, `localhost` se refiere al propio dispositivo móvil (físico o emulador) y no a la computadora que está ejecutando el backend. Para que el dispositivo móvil se comunique con tu servidor backend, debemos usar la **dirección IP local** de la computadora en la red.

---

## 🛠️ Paso a Paso para la Configuración

### Paso 1: Conectarse a la misma red Wi-Fi
> [!IMPORTANT]
> El dispositivo móvil (o emulador) y la computadora que ejecuta el backend **deben estar conectados exactamente a la misma red Wi-Fi o red local**. Si estás en redes distintas (por ejemplo, datos móviles en el celular y Wi-Fi en la laptop), no podrán comunicarse.

### Paso 2: Obtener la IP local de tu computadora
Dependiendo de tu sistema operativo, ejecuta el comando correspondiente en tu terminal:

* **En Windows (CMD o PowerShell):**
  ```bash
  ipconfig
  ```
  Busca la sección de tu adaptador activo (generalmente *Adaptador de LAN inalámbrica Wi-Fi* o *Adaptador de Ethernet*) y copia la **Dirección IPv4** (ejemplo: `192.168.0.1`).

* **En macOS o Linux (Terminal):**
  ```bash
  ifconfig
  ```
  o
  ```bash
  ip a
  ```
  Busca el adaptador activo (como `en0` o `wlan0`) y copia la dirección IP que aparece después de `inet` (ejemplo: `192.168.0.1`).

### Paso 3: Configurar el archivo `.env` en el móvil
1. Abre el archivo [.env] en la carpeta `mobile`.
2. Actualiza la variable `EXPO_PUBLIC_API_URL` colocando la IP que obtuviste en el paso anterior seguida del puerto `3000`:

```env
EXPO_PUBLIC_GOOGLE_VISION_KEY=

EXPO_PUBLIC_API_URL=http://<TU_IP_LOCAL>:3000
```

*Ejemplo:*
```env
EXPO_PUBLIC_API_URL=http://192.168.0.1:3000
```

### Paso 4: Iniciar el Servidor Backend
Asegúrate de que el backend esté corriendo en la carpeta `be`:
```bash
cd be
node server.js
```
El servidor debe mostrar en consola que está escuchando en el puerto `3000`.

### Paso 5: Iniciar Expo limpiando la caché
> Expo a veces guarda en caché las variables de entorno antiguas. Cada vez que modifiques el archivo `.env`, es muy recomendable iniciar el proyecto móvil limpiando la caché para asegurar que tome la nueva IP:
> ```bash
> cd mobile
> npx expo start -c
> ```
> *(El parámetro `-c` limpia la caché de empaquetado).*

---