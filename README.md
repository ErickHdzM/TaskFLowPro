# TaskFlowPro

API REST para gestión de proyectos y tareas con control de roles, comentarios e historial de cambios.

## Tecnologías

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **ORM:** TypeORM
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (access token + refresh token)
- **Contenedores:** Docker + Docker Compose

---

## Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose instalados
- Node.js 18+ (solo si se quiere correr sin Docker)

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd TaskFLowPro
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes:

| Variable          | Descripción                                      | Ejemplo            |
|-------------------|--------------------------------------------------|--------------------|
| `POSTGRES_USER`   | Usuario de PostgreSQL                            | `postgres`         |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL                       | `secret`           |
| `POSTGRES_DB`     | Nombre de la base de datos                       | `taskflowpro`      |
| `NODE_ENV`        | Entorno de ejecución                             | `development`      |
| `DB_HOST`         | Host de la DB (usar `db` dentro de Docker)       | `db`               |
| `DB_PORT`         | Puerto de PostgreSQL                             | `5432`             |
| `DB_USER`         | Usuario de conexión a la DB                      | `postgres`         |
| `DB_PASSWORD`     | Contraseña de conexión a la DB                   | `secret`           |
| `DB_NAME`         | Nombre de la base de datos                       | `taskflowpro`      |
| `JWT_SECRET`      | Clave secreta para firmar access tokens          | cadena aleatoria   |
| `REFRESH_SECRET`  | Clave secreta para firmar refresh tokens         | cadena aleatoria   |
| `REFRESH_EXPIRE`  | Días de expiración del refresh token             | `30`               |

### 3. Levantar con Docker Compose

```bash
docker-compose up
```

El servidor queda disponible en `http://localhost:3000`.  
La base de datos en `localhost:5432`.

> En modo `development`, TypeORM sincroniza el esquema automáticamente al iniciar.

---

## Correr tests

Los tests se ejecutan dentro del directorio `backend/`:

```bash
cd backend
npm test                   # correr todos los tests una vez
npm run test:watch         # re-ejecutar al guardar cambios
npm run test:coverage      # con reporte de cobertura
```

Para correr un archivo específico:

```bash
cd backend
npx jest src/auth/__tests__/controller.test.ts
```

---

## Endpoints disponibles

Ver la documentación completa de la API en [`docs/API.md`](docs/API.md).

Resumen de rutas:

| Prefijo      | Descripción                          |
|--------------|--------------------------------------|
| `/auth/v1`   | Registro, login y refresh de token   |
| `/users`     | Gestión de usuarios                  |
| `/project`   | Gestión de proyectos                 |
| `/member`    | Miembros de un proyecto              |
| `/task`      | Tareas de un proyecto                |
| `/comment`   | Comentarios de una tarea             |
| `/history`   | Historial de cambios de un proyecto  |

---

## Arquitectura general

```
backend/src/
├── index.ts              # Punto de entrada, registro de rutas
├── db.ts                 # Conexión a PostgreSQL vía TypeORM
├── middleware/           # Auth, permisos y manejo de errores
├── auth/                 # Login, registro y tokens
├── users/                # CRUD de usuarios
├── projects/             # CRUD de proyectos
├── project_members/      # Gestión de miembros y lógica de roles
├── tasks/                # Tareas con estados y prioridades
├── task_comments/        # Comentarios en tareas
└── history/              # Auditoría de cambios con EventEmitter
```

Cada módulo sigue la estructura: `entity → repository → service → controller → route`.

### Roles y permisos

Existen tres roles dentro de un proyecto:

| Rol      | Capacidades                                                                 |
|----------|-----------------------------------------------------------------------------|
| `owner`  | Control total: proyectos, miembros, tareas, comentarios e historial         |
| `admin`  | Gestionar miembros, tareas y comentarios; ver y editar el proyecto          |
| `editor` | Ver proyecto y miembros; actualizar y cambiar estado de tareas; comentar    |

### Sistema de historial

Cada operación de creación, actualización o eliminación emite un evento interno que registra automáticamente qué campo cambió, el valor anterior y el nuevo valor, junto con el usuario que realizó la acción.
