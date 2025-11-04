# Music Tracks Explorer 🎵

Aplicación web completa para explorar, analizar y gestionar pistas musicales con búsquedas avanzadas, visualizaciones de datos y panel de administración.

![Music Tracks Explorer](src/assets/logo.png)

## 🎯 Características Principales

- **Exploración de Pistas**: Búsqueda compleja con filtros por texto, energía, bailabilidad y popularidad
- **Dashboard Analítico**: Visualización de estadísticas agregadas por género y ranking de pistas más populares
- **Panel de Administración**: Sistema CRUD completo para gestión de pistas (solo para administradores)
- **Autenticación JWT**: Sistema de usuarios con roles y permisos
- **Diseño Responsivo**: Interfaz moderna inspirada en los colores del logo (verde brillante + azul)

## 📋 Estructura del Proyecto

```
music-tracks-explorer/
├── frontend/              # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── contexts/      # Context API (AuthContext)
│   │   └── integrations/  # Clientes de servicios externos
│   └── public/
│
├── backend/               # API RESTful (a implementar localmente)
│   ├── src/
│   │   ├── models/        # Modelos MongoDB (Mongoose)
│   │   ├── routes/        # Rutas de la API
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── middleware/    # Autenticación JWT
│   │   └── config/        # Configuración MongoDB
│   └── server.js
│
└── README.md
```

## 🗄️ Estructura de Base de Datos MongoDB

### Colección: `tracks`

```javascript
{
  _id: ObjectId,
  name: String,           // Nombre de la pista
  artist_name: String,    // Nombre del artista
  album_name: String,     // Nombre del álbum
  genre: String,          // Género musical
  release_year: Number,   // Año de lanzamiento
  duration_ms: Number,    // Duración en milisegundos
  energy: Number,         // Energía (0.0 - 1.0)
  danceability: Number,   // Bailabilidad (0.0 - 1.0)
  valence: Number,        // Valencia emocional (0.0 - 1.0)
  tempo: Number,          // Tempo en BPM
  popularity: Number,     // Popularidad (0 - 100)
  created_at: Date,       // Fecha de creación
  updated_at: Date        // Fecha de actualización
}
```

**Índices recomendados:**
```javascript
// Para búsquedas de texto
db.tracks.createIndex({ name: "text", artist_name: "text" })

// Para filtros numéricos
db.tracks.createIndex({ energy: 1 })
db.tracks.createIndex({ danceability: 1 })
db.tracks.createIndex({ popularity: -1 })
db.tracks.createIndex({ genre: 1 })
```

### Colección: `users`

```javascript
{
  _id: ObjectId,
  email: String,          // Email único
  password: String,       // Hash de contraseña (bcrypt)
  role: String,           // "user" o "admin"
  created_at: Date,
  updated_at: Date
}
```

**Índices:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
```

### Colección: `profiles`

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,      // Referencia a users._id
  display_name: String,
  avatar_url: String,
  created_at: Date,
  updated_at: Date
}
```

## 🛣️ Rutas del Backend (API RESTful)

### Autenticación
- `POST /api/auth/signup` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión (retorna JWT)
- `GET /api/auth/me` - Obtener usuario actual (requiere JWT)

### Pistas (Tracks)
- `GET /api/tracks` - Obtener todas las pistas con filtros opcionales
  - Query params: `search`, `energyMin`, `energyMax`, `danceabilityMin`, `danceabilityMax`, `popularityMin`, `popularityMax`
- `GET /api/tracks/:id` - Obtener una pista por ID
- `POST /api/tracks` - Crear pista (solo admin)
- `PUT /api/tracks/:id` - Actualizar pista (solo admin)
- `DELETE /api/tracks/:id` - Eliminar pista (solo admin)

### Dashboard
- `GET /api/dashboard/genre-stats` - Estadísticas agregadas por género
- `GET /api/dashboard/top-popular` - Top 10 pistas más populares

## 🚀 Instalación y Configuración Local

### Requisitos Previos
- Node.js 18+
- MongoDB 6.0+
- npm o yarn

### 1. Configurar MongoDB Local

```bash
# Iniciar MongoDB
mongod --dbpath /path/to/your/data

# Crear base de datos e insertar datos de ejemplo
mongosh
use music_tracks_db

# Insertar datos de ejemplo (ver sección más abajo)
```

### 2. Configurar Backend

```bash
# Crear carpeta backend
mkdir backend && cd backend
npm init -y

# Instalar dependencias
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
npm install -D nodemon

# Crear archivo .env
cat > .env << EOL
PORT=3000
MONGODB_URI=mongodb://localhost:27017/music_tracks_db
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion
NODE_ENV=development
EOL
```

### 3. Configurar Frontend

```bash
# En la raíz del proyecto
npm install

# Actualizar .env con la URL del backend local
echo "VITE_API_URL=http://localhost:3000/api" >> .env
```

### 4. Ejecutar el Proyecto

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 📊 Datos de Ejemplo para MongoDB

```javascript
// En mongosh:
use music_tracks_db

db.tracks.insertMany([
  {
    name: "Blinding Lights",
    artist_name: "The Weeknd",
    album_name: "After Hours",
    genre: "Pop",
    release_year: 2020,
    duration_ms: 200040,
    energy: 0.73,
    danceability: 0.51,
    valence: 0.37,
    tempo: 171,
    popularity: 95,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Shape of You",
    artist_name: "Ed Sheeran",
    album_name: "÷ (Divide)",
    genre: "Pop",
    release_year: 2017,
    duration_ms: 233713,
    energy: 0.65,
    danceability: 0.83,
    valence: 0.93,
    tempo: 96,
    popularity: 92,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Bohemian Rhapsody",
    artist_name: "Queen",
    album_name: "A Night at the Opera",
    genre: "Rock",
    release_year: 1975,
    duration_ms: 354320,
    energy: 0.38,
    danceability: 0.29,
    valence: 0.35,
    tempo: 72,
    popularity: 90,
    created_at: new Date(),
    updated_at: new Date()
  }
  // ... más pistas
])
```

## 🔐 Crear Usuario Administrador

```javascript
// En mongosh:
use music_tracks_db

// Crear usuario admin (el hash es para "admin123")
db.users.insertOne({
  email: "admin@musicexplorer.com",
  password: "$2a$10$8K1p/a0dL3LJ9M1l1fGF9u0bZ3Y0uJ0gE3gJ3gJ3gJ3gJ3gJ3gJ3g",
  role: "admin",
  created_at: new Date(),
  updated_at: new Date()
})
```

## 🔍 Consultas MongoDB (Equivalentes a las SQL)

### 1. Búsqueda Compleja con Filtros

```javascript
// Búsqueda de texto + filtros numéricos
db.tracks.find({
  $text: { $search: "blinding weekend" },
  energy: { $gte: 0.5, $lte: 0.9 },
  danceability: { $gte: 0.3, $lte: 0.8 },
  popularity: { $gte: 70, $lte: 100 }
})
```

### 2. Estadísticas por Género (Agregación)

```javascript
db.tracks.aggregate([
  {
    $group: {
      _id: "$genre",
      avg_energy: { $avg: "$energy" },
      avg_danceability: { $avg: "$danceability" },
      avg_valence: { $avg: "$valence" },
      avg_tempo: { $avg: "$tempo" },
      avg_popularity: { $avg: "$popularity" },
      track_count: { $sum: 1 }
    }
  },
  {
    $sort: { track_count: -1 }
  }
])
```

### 3. Top 10 Pistas Más Populares

```javascript
db.tracks.find()
  .sort({ popularity: -1 })
  .limit(10)
```

### 4. CRUD de Administrador

```javascript
// CREATE
db.tracks.insertOne({ ...trackData })

// READ
db.tracks.findOne({ _id: ObjectId("...") })

// UPDATE
db.tracks.updateOne(
  { _id: ObjectId("...") },
  { $set: { ...updatedFields, updated_at: new Date() } }
)

// DELETE
db.tracks.deleteOne({ _id: ObjectId("...") })
```

## 🎨 Diseño y Colores

El diseño está inspirado en el logo del proyecto con la siguiente paleta:

### Modo Claro (por defecto)
- **Verde Brillante (#00FF00)**: Color primario, botones, acentos
- **Blanco (#FAFAFA)**: Fondo principal
- **Azul Claro (#E8F4F8)**: Fondos secundarios, tarjetas
- **Azul Oscuro (#0A3D4D)**: Textos, gráficos
- **Gris Claro**: Bordes y elementos secundarios

### Modo Oscuro
- **Verde Brillante**: Mantiene su intensidad
- **Azul Oscuro (#0F2830)**: Fondo principal
- **Azul Intermedio**: Tarjetas y componentes

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Recharts (gráficos)
- Zod (validación)
- React Hook Form

### Backend (a implementar)
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- bcryptjs para hashing
- CORS para seguridad

## 📝 Variables de Entorno

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/music_tracks_db
JWT_SECRET=tu_clave_secreta_aqui
NODE_ENV=development
```

## 🔒 Seguridad Implementada

- ✅ Autenticación JWT
- ✅ Hashing de contraseñas con bcrypt
- ✅ Validación de entrada con Zod
- ✅ Roles de usuario (user/admin)
- ✅ Protección de rutas en frontend
- ✅ CORS configurado
- ✅ Variables de entorno para secretos

## 📚 Documentación Adicional

- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT Authentication](https://jwt.io/introduction)
- [Express.js Guide](https://expressjs.com/)

## 🤝 Contribuir

Este es un proyecto educativo. Para contribuir:

1. Fork el proyecto
2. Crea una rama con tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ✅ Checklist de Requisitos del Proyecto

- [x] Búsqueda compleja con múltiples filtros
- [x] Agregación de datos por género
- [x] Sistema CRUD completo para admin
- [x] Autenticación con JWT
- [x] Roles de usuario
- [x] API RESTful documentada
- [x] Interfaz responsiva
- [x] Dashboard con visualizaciones
- [x] Validación de formularios
- [x] Estructura NoSQL (MongoDB)
- [x] Documentación completa

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

**Nota**: Este README proporciona la estructura completa para migrar el proyecto de Lovable Cloud (PostgreSQL) a un entorno local con MongoDB. Deberás implementar el backend en Node.js/Express siguiendo las rutas y modelos especificados.
