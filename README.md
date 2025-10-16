# 🗺️ Visor NDVI Histórico (Frontend React)

Este repositorio contiene el frontend (cliente) del Visor de NDVI, implementado con **React**, **Leaflet** y librerías de visualización de datos. La interfaz permite a los usuarios seleccionar un Área de Interés (AOI) y una fecha, solicitando el cálculo del NDVI (Índice de Vegetación de Diferencia Normalizada) al servicio backend (Render/Flask/GEE).

## 🚀 Funcionalidades Clave

- **Mapa Interactivo:** Utiliza Leaflet y `react-leaflet` con herramientas de dibujo.
- **Cálculo Dinámico de NDVI:** Envía la geometría y la fecha seleccionadas al Backend de forma asíncrona.
- **Visualización de Resultados:** Muestra el valor de NDVI promedio, detalles de la imagen satelital utilizada y superpone el mosaico ráster de NDVI en el mapa.
- **Gráfico de Tendencia:** Utiliza un gráfico para visualizar la historia de los valores de NDVI calculados para la misma AOI.

---

## 🛠️ Configuración Local

### 1\. Requisitos

- Node.js (versión 18+ recomendada)
- Tener el **Servicio GEE (Backend)** corriendo localmente o haber desplegado el backend en **Render**.

### 2\. Instalación y Ejecución

1.  **Instalar dependencias:**

    ```bash
    npm install
    ```

2.  **Iniciar la aplicación (Modo Desarrollo):**

    ```bash
    npm start
    ```

> La aplicación se abrirá en tu navegador en `http://localhost:3000`.

---

## 🌐 Despliegue y Conexión de API (Vercel)

El Frontend está configurado con lógica de autodetección de entorno para usar la URL correcta de la API.

### Configuración de Conexión

El archivo **`src/App.js`** contiene la lógica para conmutar entre los entornos. Para producción:

- **Asegúrate de que la URL de Render sea correcta en `src/App.js`:**

  ```javascript
  // src/App.js (Línea de configuración crítica)
  const RENDER_API_BASE_URL = "https://ndvi-api-service.onrender.com";
  ```

### Pasos Sugeridos para Vercel

1.  Conecta Vercel a tu repositorio de Frontend.
2.  **Root Directory:** Si el código React está en una subcarpeta (ej. `frontend`), configúralo como la subcarpeta.
3.  **Build Command:** `npm run build` (detectado automáticamente).
4.  Realiza el despliegue.

---

## 👨‍💻 Autor y Contacto

Este proyecto ha sido desarrollado por **Pedro Alcoba Gómez**.

- **Especialidad:** Técnico ambiental especializado en Sistemas de Información Geográfica (SIG), teledetección y tecnologías geoespaciales como Google Earth Engine (GEE).
- **Web/Proyectos:** [pedralcg.github.io](https://www.google.com/search?q=https://pedralcg.github.io)
- **LinkedIn:** [linkedin.com/in/pedro-alcoba-gomez](https://www.google.com/search?q=https://linkedin.com/in/pedro-alcoba-gomez)
- **Email:** pedralcg.dev@gmail.com
