# Movies

Aplicación web para explorar películas con los datos de [TMDB](https://www.themoviedb.org/) y guardar tus favoritas. Es un ejercicio del Sprint 5 de IT Academy.

## Funcionalidades

- **Bienvenida** con las tendencias de la semana y acceso directo a la exploración.
- **Exploración** del catálogo con búsqueda por título, filtros de género y puntuación TMDB mínima, orden y paginación. Todo se guarda en la URL, así que se puede compartir o volver atrás.
- **Fichas de películas** con sinopsis, datos principales, reparto, dirección y tráiler.
- **Fichas de actores y directores** con su biografía y su filmografía.
- **Cuentas de usuario:** registro e inicio de sesión con correo y contraseña o con Google, perfil y cierre de sesión.
- **Favoritas:** con sesión iniciada, marca películas desde su ficha y consúltalas o quítalas en «Mis favoritas». Se guardan en la nube y se sincronizan en tiempo real.

Las páginas de exploración y las fichas son públicas; «Mis favoritas» y el perfil requieren iniciar sesión.

**Fuera del alcance:** puntuaciones personales, ranking personal y ranking medio de los usuarios. El ejercicio termina en los favoritos.

## Tecnologías

| Parte         | Tecnología                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Frontend      | Angular 22 (componentes standalone, signals, `httpResource`, formularios reactivos), TypeScript y RxJS |
| Proxy de TMDB | Flask (Python): guarda el token de TMDB en el servidor y expone `/api/tmdb/...`                        |
| Usuarios      | Firebase Authentication (correo y contraseña, Google)                                                  |
| Favoritas     | Cloud Firestore, protegido con reglas de seguridad (`firestore.rules`)                                 |
| Pruebas       | Vitest y jsdom en el frontend; `unittest` en el backend. Escenarios Gherkin en archivos `.feature`     |

## Puesta en marcha

### Requisitos

- Node.js y npm (versión compatible con Angular 22).
- Python 3.
- Un **API Read Access Token** de TMDB (en tu cuenta de TMDB: _Settings → API_).

### 1. Backend (Flask)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Abre `backend/.env` y pega tu token en `TMDB_READ_ACCESS_TOKEN`. Este archivo no se sube al repositorio. Después:

```bash
python app.py
```

El servidor queda escuchando en `http://127.0.0.1:5001`.

### 2. Frontend (Angular)

En otra terminal, desde la raíz del proyecto:

```bash
npm ci
npm start
```

Abre `http://localhost:4200/`. En desarrollo, `proxy.conf.json` reenvía las peticiones a `/api` hacia Flask, así que el frontend nunca conoce el token de TMDB.

### Firebase

La configuración web de Firebase está en `src/app/core/config/firebase.ts`. Es pública por diseño: solo identifica el proyecto. Lo que protege los datos son las reglas de `firestore.rules`, que solo dejan a cada usuario leer y escribir sus propias favoritas. Si cambias las reglas, publícalas en la consola de Firebase (_Firestore → Reglas_).

## Pruebas y build

| Acción              | Comando                                                              |
| ------------------- | -------------------------------------------------------------------- |
| Tests del frontend  | `npm test -- --watch=false`                                          |
| Tests del backend   | `cd backend && python -m unittest` (con el entorno virtual activado) |
| Build de producción | `npm run build` (genera `dist/`)                                     |

## Estructura del proyecto

```text
backend/            proxy de TMDB en Flask y sus tests
docs/               documentación del proyecto
public/i18n/es.json textos de la interfaz
src/app/
├── core/           servicios y configuración: catálogo TMDB, sesión, favoritas, Firebase
├── shared/         componentes de interfaz y pipes reutilizables
├── layout/         navegación y menú de usuario
└── features/       una carpeta por página: home, explore, movie-detail, person, access, profile, favorites
firestore.rules     reglas de seguridad de Firestore
```

## Documentación

- [Componentes y servicios · Arquitectura de Movies](docs/componentes-y-servicios.md): rutas, servicios, modelo de datos en Firestore y componentes de cada página.

## Atribución

Movies usa TMDB y las API de TMDB, pero TMDB no la respalda, certifica ni aprueba de ninguna otra forma.

> This application uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
