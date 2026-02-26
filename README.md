# 📌 Gestor de Pagos

Sistema web para gestionar pagos pendientes con CRUD y calendario interactivo.

## 🏗 Estructura del Proyecto

```bash
gestor-pagos/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── routes/
│
└── frontend/
    ├── angular.json
    ├── package.json
    └── src/
```

---

## 📂 Descripción de Carpetas

### 🔹 backend/

Contiene el servidor desarrollado con Node.js y Express.

* `server.js` → Archivo principal del servidor.
* `package.json` → Dependencias del backend.
* `routes/` → Rutas de la API (CRUD de pagos).

El backend se conecta a MySQL (XAMPP) y expone una API REST.

---

### 🔹 frontend/

Contiene la aplicación desarrollada en Angular 17.

* `angular.json` → Configuración del proyecto Angular.
* `package.json` → Dependencias del frontend.
* `src/` → Código fuente de la aplicación.

El frontend consume la API del backend mediante HttpClient.

---

## 🚀 Cómo ejecutar el proyecto

### 1️⃣ Iniciar MySQL (XAMPP)

Abrir XAMPP y activar MySQL.

---

### 2️⃣ Ejecutar Backend

```bash
cd backend
npm install
node server.js
```

Servidor disponible en:

```
http://localhost:3000
```

---

### 3️⃣ Ejecutar Frontend

```bash
cd frontend
npm install
ng serve
```

Aplicación disponible en:

```
http://localhost:4200
```

---

## 🛠 Tecnologías Utilizadas

* Angular 17
* Node.js
* Express
* MySQL (XAMPP)
* FullCalendar

---

## 🎯 Funcionalidades

* Crear pagos
* Listar pagos
* Editar estado (pendiente / pagado)
* Eliminar pagos
* Visualización en calendario interactivo
* Persistencia en base de datos MySQL

---


