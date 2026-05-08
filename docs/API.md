# Documentación de la API — TaskFlowPro

Base URL: `http://localhost:3000`

## Autenticación

La mayoría de los endpoints requieren un **access token JWT** enviado en el header:

```
Authorization: Bearer <access_token>
```

Los tokens se obtienen al hacer login o registro. Cuando el access token expira, se puede renovar usando el endpoint de refresh.

---

## Errores comunes

| Código | Significado                                         |
|--------|-----------------------------------------------------|
| `400`  | Datos faltantes o inválidos en el cuerpo            |
| `401`  | Token ausente o inválido                            |
| `403`  | El usuario no tiene permisos para esa acción        |
| `404`  | El recurso solicitado no existe                     |
| `500`  | Error interno del servidor                          |

---

## Autenticación (`/auth/v1`)

### Registrar usuario

```
POST /auth/v1/register
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "username": "miusuario",
  "first_name": "Juan",
  "last_name": "Pérez"
}
```
> `email` y `password` son requeridos. El resto es opcional.

**Respuesta exitosa** `201`:
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "username": "miusuario",
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### Iniciar sesión

```
POST /auth/v1/login
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa** `200`:
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### Renovar access token

```
POST /auth/v1/refresh
```

**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Respuesta exitosa** `200`:
```json
{
  "accessToken": "eyJ..."
}
```

---

## Usuarios (`/users`)

> Estos endpoints no requieren autenticación actualmente.

### Listar todos los usuarios

```
GET /users
```

### Obtener usuario por ID

```
GET /users/:id
```

### Crear usuario

```
POST /users
```

---

## Proyectos (`/project`)

> Todos los endpoints requieren autenticación.

### Listar proyectos del usuario autenticado

```
GET /project
```
**Headers:** `Authorization: Bearer <token>`

**Respuesta exitosa** `200`: lista de proyectos donde el usuario es miembro.

---

### Obtener un proyecto

```
GET /project/:project_id
```
**Permisos requeridos:** `project → get`

---

### Crear proyecto

```
POST /project
```

**Body:**
```json
{
  "title": "Mi Proyecto",
  "description": "Descripción opcional"
}
```

El usuario que crea el proyecto queda automáticamente como `owner`.

**Respuesta exitosa** `201`.

---

### Actualizar proyecto

```
PUT /project/:project_id
```
**Permisos requeridos:** `project → update`

**Body:**
```json
{
  "title": "Nuevo título",
  "description": "Nueva descripción"
}
```
Ambos campos son opcionales.

---

### Eliminar proyecto

```
DELETE /project/:project_id
```
**Permisos requeridos:** `project → delete`

---

## Miembros (`/member`)

### Listar miembros de un proyecto

```
GET /member/:project_id
```
**Permisos requeridos:** `members → get`

---

### Agregar miembro

```
POST /member/:project_id
```
**Permisos requeridos:** `members → create`

**Body:**
```json
{
  "user_id": "uuid-del-usuario",
  "role": "editor"
}
```

Roles disponibles: `owner`, `admin`, `editor`. El campo `role` es opcional (por defecto `editor`).

---

### Actualizar rol de un miembro

```
PUT /member/:project_id/:id
```
**Permisos requeridos:** `members → update`

**Body:**
```json
{
  "role": "admin"
}
```

---

### Eliminar miembro

```
DELETE /member/:project_id/:id
```
**Permisos requeridos:** `members → delete`

---

## Tareas (`/task`)

### Listar tareas de un proyecto

```
GET /task/:project_id
```
**Permisos requeridos:** `tasks → get`

---

### Obtener tarea por ID

```
GET /task/:project_id/:id
```
**Permisos requeridos:** `tasks → get`

---

### Crear tarea

```
POST /task/:project_id
```
**Permisos requeridos:** `tasks → create`

**Body:**
```json
{
  "title": "Nombre de la tarea",
  "description": "Descripción opcional",
  "status": "open",
  "priority": "medium"
}
```

**Valores de `status`:** `open`, `in progress`, `pending`, `resolved`, `closed`  
**Valores de `priority`:** `planning`, `low`, `medium`, `high`, `critical`

Todos los campos excepto `title` son opcionales.

---

### Actualizar tarea

```
PUT /task/:project_id/:id
```
**Permisos requeridos:** `tasks → update`

**Body:**
```json
{
  "title": "Nuevo título",
  "description": "Nueva descripción",
  "priority": "high"
}
```
Todos los campos son opcionales. Para cambiar el estado usar el endpoint dedicado.

---

### Cambiar estado de una tarea

```
PUT /task/:project_id/:id/change_status
```
**Permisos requeridos:** `tasks → change_status`

**Body:**
```json
{
  "status": "in progress"
}
```

---

### Eliminar tarea

```
DELETE /task/:project_id/:id
```
**Permisos requeridos:** `tasks → delete`

---

## Comentarios (`/comment`)

### Agregar comentario a una tarea

```
POST /comment/:project_id/:task_id
```
**Permisos requeridos:** `comments → create`

**Body:**
```json
{
  "comment": "Texto del comentario"
}
```

---

### Eliminar comentario

```
DELETE /comment/:project_id/:task_id/:comment_id
```
**Permisos requeridos:** `comments → delete`

---

## Historial (`/history`)

### Obtener historial de cambios de un proyecto

```
GET /history/:project_id
```
**Permisos requeridos:** `history → get`

Devuelve todos los eventos de auditoría del proyecto: qué acción se hizo (`create`, `update`, `delete`), sobre qué recurso, qué campos cambiaron, los valores anteriores y nuevos, y quién lo hizo.

---

## Tabla de permisos por rol

| Recurso     | Acción          | `owner` | `admin` | `editor` |
|-------------|-----------------|:-------:|:-------:|:--------:|
| `project`   | `get`           | ✓       | ✓       | ✓        |
| `project`   | `create`        | ✓       |         |          |
| `project`   | `update`        | ✓       | ✓       |          |
| `project`   | `delete`        | ✓       |         |          |
| `members`   | `get`           | ✓       | ✓       | ✓        |
| `members`   | `create`        | ✓       | ✓       |          |
| `members`   | `update`        | ✓       | ✓       |          |
| `members`   | `delete`        | ✓       |         |          |
| `tasks`     | `get`           | ✓       | ✓       | ✓        |
| `tasks`     | `create`        | ✓       | ✓       |          |
| `tasks`     | `update`        | ✓       | ✓       | ✓        |
| `tasks`     | `delete`        | ✓       | ✓       |          |
| `tasks`     | `change_status` | ✓       | ✓       | ✓        |
| `comments`  | `get`           | ✓       | ✓       | ✓        |
| `comments`  | `create`        | ✓       | ✓       | ✓        |
| `comments`  | `update`        | ✓       | ✓       | ✓        |
| `comments`  | `delete`        | ✓       | ✓       | ✓        |
| `history`   | `get`           | ✓       | ✓       | ✓        |
