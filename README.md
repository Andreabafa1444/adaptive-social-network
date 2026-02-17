# Adaptive Social Network (ASN)

Adaptive Social Network es una aplicación web progresiva (PWA) desarrollada con React y Firebase, creada con fines académicos para el proyecto de tesina:

**“Diseño y análisis de interfaces adaptativas en aplicaciones web/móviles según condiciones de conectividad.”**

---

## 📌 Propósito del proyecto

El objetivo principal es analizar cómo una interfaz puede adaptarse dinámicamente según la calidad de conexión del usuario (offline, conexión limitada o conexión estable).

La aplicación simula el comportamiento de una red social moderna tipo Twitter/X, permitiendo:

- Publicar contenido
- Interactuar con likes y comentarios
- Guardar publicaciones
- Explorar contenido por hashtags
- Adaptar visualmente la experiencia según la conectividad

---

## 🌐 URL del proyecto (Producción)

🔗 https://adaptive-social-network.web.app

---

## 📱 Instalación como aplicación (PWA)

### Android

1. Abrir la URL en Google Chrome.
2. Presionar los tres puntos (⋮).
3. Seleccionar **"Agregar a la pantalla principal"**.
4. Elegir **Instalar**.

La aplicación se instalará como app independiente.

---

### iOS

1. Abrir la URL en Safari.
2. Presionar el botón **Compartir**.
3. Seleccionar **"Agregar a Inicio"**.
4. Confirmar.

La aplicación funcionará como aplicación web instalada.

---

## ⚙️ Tecnologías utilizadas

- React
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Service Workers (PWA)
- Network Information API
- Unsplash API (búsqueda de imágenes)

---

## 🧠 Características adaptativas

La aplicación detecta automáticamente el estado de conexión:

🟢 Conexión estable  
🔴 Sin conexión  
🟡 Conexión limitada (en pruebas)

Según el estado:

- Se cargan u ocultan imágenes.
- Se limita la actualización en tiempo real.
- Se mantiene contenido en caché para uso offline.

---

## 📊 Estado actual

✔ Autenticación funcional  
✔ Feed dinámico  
✔ Sistema de comentarios  
✔ Instalación como PWA  
✔ Adaptación básica según conectividad  
✔ Integración con API externa (Unsplash)

---

## 🎓 Uso académico

Este proyecto fue desarrollado exclusivamente con fines académicos como parte del Seminario de Investigación II de la carrera:

**Ingeniería en Computación Inteligente**

No tiene fines comerciales.

---

## 👩‍💻 Autor

Andrea Margarita Balandrán Félix  
Generación 2026
