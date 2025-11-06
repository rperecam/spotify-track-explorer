# Music Tracks Explorer 🎵

## 📚 Descripción

Music Tracks Explorer es una aplicación web completa que permite explorar, analizar y gestionar pistas musicales con búsquedas avanzadas y visualizaciones analíticas.

![Music Tracks Explorer](src/assets/logo.png)

---

## 🚀 Instalación y Configuración Local

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v16 o superior) - [Descargar aquí](https://nodejs.org/)
- **MongoDB** (v5.0 o superior) - [Guía de instalación](#instalación-de-mongodb)
- **npm** o **yarn** (incluido con Node.js)

### Instalación de MongoDB

#### Windows

1. Descarga MongoDB Community Server desde [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Ejecuta el instalador y sigue las instrucciones
3. Selecciona "Complete" como tipo de instalación
4. Instala MongoDB como servicio de Windows
5. Verifica la instalación:
   ```bash
   mongod --version
   ```

#### macOS

Usando Homebrew:
```bash
# Instalar MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Iniciar el servicio
brew services start mongodb-community

# Verificar la instalación
mongosh --version
```

#### Linux (Ubuntu/Debian)

```bash
# Importar la clave pública de MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Crear el archivo de lista para MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Actualizar la base de datos de paquetes e instalar MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar estado
sudo systemctl status mongod
```

---

### Configuración del Backend

1. **Navega al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   
   Crea un archivo `.env` en el directorio `backend` con el siguiente contenido:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/music-tracks-explorer
   JWT_SECRET=tu_clave_secreta_muy_segura_aqui
   NODE_ENV=development
   ```

   **Nota:** Cambia `JWT_SECRET` por una clave secreta única y segura.

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   El servidor estará corriendo en `http://localhost:5000`

5. **Verifica que el backend funcione:**
   
   Abre tu navegador y visita `http://localhost:5000/api/auth/me` o prueba con:
   ```bash
   curl http://localhost:5000/api/auth/me
   ```

---

### Configuración del Frontend

1. **Navega al directorio raíz del proyecto** (si estás en `backend`, vuelve atrás):
   ```bash
   cd ..
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   
   Crea un archivo `.env` en el directorio raíz con el siguiente contenido:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne)

---

### Insertar Datos de Prueba

Para poblar la base de datos con datos de ejemplo, sigue estas instrucciones:

#### Opción 1: Usando MongoDB Compass (GUI)

1. Descarga e instala [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Conéctate a `mongodb://localhost:27017`
3. Crea una base de datos llamada `music-tracks-explorer`
4. Crea las colecciones: `tracks`, `users`, `profiles`
5. Importa los datos de ejemplo desde los archivos JSON (ver sección de Datos de Ejemplo)

#### Opción 2: Usando mongosh (CLI)

1. Abre una terminal y conéctate a MongoDB:
   ```bash
   mongosh
   ```

2. Selecciona la base de datos:
   ```javascript
   use music-tracks-explorer
   ```

3. Inserta pistas de ejemplo:
   ```javascript
   db.tracks.insertMany([
     {
       name: "Blinding Lights",
       artist_name: "The Weeknd",
       year: 2019,
       genre: "Synth-pop",
       popularity: 95,
       energy: 0.73,
       danceability: 0.51,
       tempo: 171.0,
       duration_ms: 200040,
       valence: 0.33
     },
     {
       name: "Shape of You",
       artist_name: "Ed Sheeran",
       year: 2017,
       genre: "Pop",
       popularity: 93,
       energy: 0.65,
       danceability: 0.83,
       tempo: 96.0,
       duration_ms: 233713,
       valence: 0.93
     },
     {
       name: "Bohemian Rhapsody",
       artist_name: "Queen",
       year: 1975,
       genre: "Rock",
       popularity: 90,
       energy: 0.38,
       danceability: 0.29,
       tempo: 72.0,
       duration_ms: 354320,
       valence: 0.35
     }
   ]);
   ```

4. Crea un usuario administrador:
   ```javascript
   db.users.insertOne({
     email: "admin@example.com",
     password: "$2a$10$5Hy8xDOPNH8pf7XYFQvzTu9p0yYKV0kP2aZhMm3Uw1q5Xz4Y6Z2K.", // Password: admin123
     role: "admin",
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

   **Nota:** La contraseña hasheada corresponde a `admin123`. Para mayor seguridad, usa el endpoint de registro del backend para crear usuarios con contraseñas hasheadas correctamente.

---

### Verificar la Instalación

1. **Backend:** Verifica que el servidor responda en `http://localhost:5000/api`
2. **Frontend:** Abre `http://localhost:5173` en tu navegador
3. **Base de Datos:** Usa MongoDB Compass o mongosh para verificar que las colecciones se hayan creado correctamente

---

## 📂 Estructura del Proyecto

```
music-tracks-explorer/
├── backend/                    # API RESTful (Node.js + Express + MongoDB)
│   ├── config/                # Configuración de la base de datos
│   ├── controllers/           # Lógica de negocio (auth, tracks, dashboard)
│   ├── middleware/            # Autenticación JWT y permisos
│   ├── models/                # Modelos de Mongoose (User, Track, Profile)
│   ├── routes/                # Rutas de la API REST
│   ├── server.js              # Punto de entrada del servidor
│   ├── package.json           # Dependencias del backend
│   └── README.md              # Documentación detallada del backend
│
├── src/                       # Frontend (React + TypeScript + Vite)
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes de UI (shadcn)
│   │   ├── Navbar.tsx        # Barra de navegación
│   │   └── TrackSearchList.tsx # Lista de búsqueda de pistas
│   ├── contexts/              # Context API para estado global
│   │   └── AuthContext.tsx   # Contexto de autenticación
│   ├── pages/                 # Páginas principales
│   │   ├── Index.tsx         # Página de inicio
│   │   ├── Auth.tsx          # Página de login/registro
│   │   ├── Explore.tsx       # Exploración de pistas
│   │   ├── Dashboard.tsx     # Dashboard analítico
│   │   └── Admin.tsx         # Panel de administración
│   └── integrations/          # Integración con Supabase
│
├── public/                    # Archivos estáticos
├── README.md                  # Este archivo
└── package.json               # Dependencias del frontend
```

---

## 🗄️ Estructura de Base de Datos MongoDB

### Colección: `tracks`

Almacena información detallada de las pistas musicales.

```javascript
{
  _id: ObjectId,
  name: String,           // Nombre de la pista
  artist_name: String,    // Nombre del artista
  year: Number,           // Año de lanzamiento
  genre: String,          // Género musical
  popularity: Number,     // Popularidad (0-100)
  energy: Number,         // Energía (0.0-1.0)
  danceability: Number,   // Bailabilidad (0.0-1.0)
  tempo: Number,          // Tempo en BPM
  duration_ms: Number,    // Duración en milisegundos
  valence: Number,        // Valencia emocional (0.0-1.0)
  created_at: Date,
  updated_at: Date
}
```

**Índices recomendados:**
```javascript
// Índice de texto para búsquedas
db.tracks.createIndex({ name: "text", artist_name: "text" })

// Índices compuestos para filtros
db.tracks.createIndex({ energy: 1, danceability: 1, popularity: 1 })
db.tracks.createIndex({ genre: 1, popularity: -1 })
```

### Colección: `users`

Gestiona usuarios y roles de autenticación.

```javascript
{
  _id: ObjectId,
  email: String,          // Email único
  password: String,       // Hash bcrypt de la contraseña
  role: String,           // "user" o "admin"
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
```

### Colección: `profiles`

Información adicional de los usuarios.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,      // Referencia a users._id
  display_name: String,
  avatar_url: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🛣️ API Endpoints

Ver documentación completa en [`backend/README.md`](backend/README.md)

### Autenticación
- `POST /api/auth/signup` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión (retorna JWT)
- `GET /api/auth/me` - Obtener usuario actual (requiere JWT)

### Pistas (Tracks)
- `GET /api/tracks` - Listar pistas con filtros opcionales
- `GET /api/tracks/:id` - Obtener una pista por ID
- `POST /api/tracks` - Crear pista (solo admin)
- `PUT /api/tracks/:id` - Actualizar pista (solo admin)
- `DELETE /api/tracks/:id` - Eliminar pista (solo admin)

### Dashboard
- `GET /api/dashboard/genre-stats` - Estadísticas agregadas por género
- `GET /api/dashboard/top-popular` - Top 10 pistas más populares

---

## 📊 Consultas MongoDB de Ejemplo

### Búsqueda Compleja con Filtros

```javascript
// Búsqueda de texto + filtros numéricos
db.tracks.find({
  $text: { $search: "blinding weekend" },
  energy: { $gte: 0.5, $lte: 0.9 },
  danceability: { $gte: 0.3, $lte: 0.8 },
  popularity: { $gte: 70, $lte: 100 }
}).limit(20)
```

### Agregación de Estadísticas por Género

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

### Top 10 Pistas Más Populares

```javascript
db.tracks.find()
  .sort({ popularity: -1 })
  .limit(10)
```

---

## 🎨 Diseño y Colores

La aplicación usa una paleta de colores oscura inspirada en el logo (amarillo vibrante + gris oscuro):

### Paleta Principal

- **Background**: `#141414` (casi negro) - Fondo principal de la aplicación
- **Foreground**: `#EBEBEB` (gris claro) - Texto principal con alto contraste
- **Primary**: `#FFC107` (amarillo/dorado) - Color principal del logo, botones y acentos
- **Card**: `#1E1E1E` (gris muy oscuro) - Fondo de tarjetas y componentes
- **Secondary**: `#2E2E2E` (gris oscuro) - Fondos secundarios y hover states
- **Border**: `#383838` (gris medio oscuro) - Bordes y separadores
- **Accent**: `#FFD54F` (amarillo claro) - Efectos hover e interactivos
- **Destructive**: `#F44336` (rojo) - Alertas y acciones destructivas

### Características de Diseño

- ✨ **Alto Contraste**: Textos claros sobre fondos oscuros para facilitar la lectura prolongada
- 🎯 **Acentos Vibrantes**: Amarillo dorado para elementos interactivos y llamadas a la acción
- 💫 **Efectos Modernos**: Sombras sutiles con resplandor amarillo para profundidad
- 📱 **Diseño Responsivo**: Adaptable a móviles, tablets y escritorio

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework de estilos utility-first
- **React Router DOM** - Enrutamiento
- **Recharts** - Gráficos y visualizaciones
- **Zod** - Validación de esquemas
- **React Hook Form** - Gestión de formularios
- **shadcn/ui** - Componentes de UI modernos

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Hashing de contraseñas
- **CORS** - Control de acceso HTTP

---

## 📝 Variables de Entorno

### Frontend (`.env` en raíz)

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/music-tracks-explorer
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion
NODE_ENV=development
```

---

## 🔒 Seguridad Implementada

- ✅ **Autenticación JWT** - Tokens seguros para sesiones
- ✅ **Hashing de Contraseñas** - bcrypt con salt rounds
- ✅ **Validación de Entrada** - Zod para validación de esquemas
- ✅ **Roles de Usuario** - Control de acceso basado en roles (user/admin)
- ✅ **Protección de Rutas** - Middleware de autenticación
- ✅ **CORS Configurado** - Control de orígenes permitidos
- ✅ **Variables de Entorno** - Secretos fuera del código

---

## 🎯 Características Principales

- 🔍 **Exploración de Pistas**: Búsqueda compleja con filtros por texto, energía, bailabilidad y popularidad
- 📊 **Dashboard Analítico**: Visualización de estadísticas agregadas por género y ranking de pistas más populares
- 🛡️ **Panel de Administración**: Sistema CRUD completo para gestión de pistas (solo para administradores)
- 🔐 **Autenticación JWT**: Sistema de usuarios con roles y permisos
- 🎨 **Diseño Responsivo**: Interfaz moderna con paleta oscura y acentos vibrantes

---

## 📚 Documentación Adicional

- [Backend README](backend/README.md) - Documentación detallada del API
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT Authentication](https://jwt.io/introduction)
- [Express.js Guide](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🤝 Contribuir

Este es un proyecto educativo. Para contribuir:

1. Fork el proyecto
2. Crea una rama con tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## ✅ Checklist de Funcionalidades

- [x] Búsqueda compleja con múltiples filtros
- [x] Agregación de datos por género
- [x] Sistema CRUD completo para admin
- [x] Autenticación con JWT
- [x] Roles de usuario (user/admin)
- [x] API RESTful documentada
- [x] Interfaz responsiva con diseño oscuro
- [x] Dashboard con visualizaciones (Recharts)
- [x] Validación de formularios (Zod)
- [x] Base de datos NoSQL (MongoDB)
- [x] Documentación completa
- [x] Backend implementado completamente

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

**Desarrollado con ❤️ usando React, TypeScript, MongoDB y Express**
