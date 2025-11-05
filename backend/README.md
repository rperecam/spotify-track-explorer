# Music Tracks Explorer - Backend

Backend API REST para el sistema de exploración y análisis de música.

## Tecnologías

- **Node.js** v18+
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas

## Instalación

### 1. Instalar MongoDB

**Windows:**
```bash
# Descargar desde: https://www.mongodb.com/try/download/community
# Ejecutar el instalador
# MongoDB se ejecutará como servicio automáticamente
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/music_tracks_explorer
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion
```

### 3. Iniciar el Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## Estructura del Proyecto

```
backend/
├── config/
│   └── database.js       # Configuración de MongoDB
├── controllers/
│   ├── authController.js     # Lógica de autenticación
│   ├── tracksController.js   # Lógica de tracks
│   └── dashboardController.js # Lógica de dashboard
├── middleware/
│   └── auth.js          # Middleware de autenticación JWT
├── models/
│   ├── User.js          # Modelo de usuario
│   ├── Profile.js       # Modelo de perfil
│   └── Track.js         # Modelo de track
├── routes/
│   ├── auth.js          # Rutas de autenticación
│   ├── tracks.js        # Rutas de tracks
│   └── dashboard.js     # Rutas de dashboard
├── .env.example         # Variables de entorno ejemplo
├── .gitignore
├── package.json
├── README.md
└── server.js            # Punto de entrada
```

## API Endpoints

### Autenticación

#### POST /api/auth/signup
Registrar nuevo usuario
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

#### POST /api/auth/login
Iniciar sesión
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Obtener usuario actual (requiere token JWT)
```
Headers: Authorization: Bearer <token>
```

### Tracks

#### GET /api/tracks
Obtener tracks con filtros
```
Query params:
- search: búsqueda por nombre o artista
- energy_min, energy_max: rango de energía (0-1)
- danceability_min, danceability_max: rango de bailabilidad (0-1)
- popularity_min, popularity_max: rango de popularidad (0-100)
- limit: número de resultados (default: 50)
- page: página de resultados (default: 1)
```

#### GET /api/tracks/:id
Obtener un track específico

#### POST /api/tracks
Crear nuevo track (requiere admin)
```
Headers: Authorization: Bearer <token>
```

#### PUT /api/tracks/:id
Actualizar track (requiere admin)
```
Headers: Authorization: Bearer <token>
```

#### DELETE /api/tracks/:id
Eliminar track (requiere admin)
```
Headers: Authorization: Bearer <token>
```

### Dashboard

#### GET /api/dashboard/genre-stats
Obtener estadísticas por género

#### GET /api/dashboard/top-popular
Obtener top tracks más populares
```
Query params:
- limit: número de resultados (default: 10)
```

## Base de Datos

### Colección: tracks

```javascript
{
  _id: ObjectId,
  name: String,
  artist_name: String,
  year: Number,
  genre: String,
  duration_ms: Number,
  popularity: Number (0-100),
  danceability: Number (0-1),
  energy: Number (0-1),
  key: Number (0-11),
  loudness: Number,
  mode: Number (0-1),
  speechiness: Number (0-1),
  acousticness: Number (0-1),
  instrumentalness: Number (0-1),
  liveness: Number (0-1),
  valence: Number (0-1),
  tempo: Number,
  time_signature: Number (0-7),
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- Text index: `{ name: 'text', artist_name: 'text' }`
- `{ genre: 1, popularity: -1 }`
- `{ energy: 1, danceability: 1 }`

### Colección: users

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  role: String ('user' | 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

### Colección: profiles

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  display_name: String,
  avatar_url: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Datos de Ejemplo

### Insertar tracks de ejemplo

```javascript
// Conectarse a MongoDB
mongosh

// Usar la base de datos
use music_tracks_explorer

// Insertar tracks
db.tracks.insertMany([
  {
    name: "Blinding Lights",
    artist_name: "The Weeknd",
    year: 2019,
    genre: "Pop",
    duration_ms: 200040,
    popularity: 95,
    danceability: 0.514,
    energy: 0.730,
    key: 1,
    loudness: -5.934,
    mode: 1,
    speechiness: 0.0598,
    acousticness: 0.00146,
    instrumentalness: 0.000177,
    liveness: 0.0897,
    valence: 0.334,
    tempo: 171.005,
    time_signature: 4
  },
  // ... más tracks
])
```

### Crear usuario administrador

```javascript
// En mongosh
use music_tracks_explorer

// Primero, necesitas el hash de la contraseña
// Ejecuta en Node.js:
// const bcrypt = require('bcryptjs');
// const hash = await bcrypt.hash('admin123', 10);
// console.log(hash);

db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$10$tu_hash_aqui",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Conectar Frontend

En tu archivo `.env` del frontend (raíz del proyecto):

```env
VITE_API_URL=http://localhost:5000
```

## Testing

Verificar que el servidor esté funcionando:

```bash
curl http://localhost:5000/api/health
```

## Seguridad

- Contraseñas hasheadas con bcryptjs (10 salt rounds)
- Autenticación JWT con tokens que expiran en 30 días
- Middleware de protección de rutas
- Validación de datos con Mongoose schemas
- Control de acceso basado en roles (user/admin)

## Troubleshooting

**MongoDB no se conecta:**
- Verifica que MongoDB esté ejecutándose: `mongosh`
- Revisa la URI en `.env`
- En Windows, verifica el servicio: Services → MongoDB Server

**Error de autenticación:**
- Verifica que JWT_SECRET esté configurado
- Revisa que el token se envíe correctamente en headers

**Puerto en uso:**
- Cambia el PORT en `.env`
- O mata el proceso: `lsof -ti:5000 | xargs kill` (macOS/Linux)
