# Explorador de Datos de Spotify - Ejercicio Final MAI

## 📋 Descripción del Proyecto

Aplicación web full-stack para la exploración y análisis de datos de pistas de Spotify. Implementa un sistema completo con búsqueda compleja, agregaciones de datos, autenticación de usuarios y panel de administración CRUD.

**Universidad Alfonso X el Sabio**  
**Asignatura:** Modelado Avanzado de la Información  
**Tecnologías:** React + TypeScript (Frontend) | PostgreSQL + Supabase (Backend)

---

## 🎯 Características Principales

### 1. **Búsqueda Compleja (Multi-campo)**
- Búsqueda por texto: nombre de canción y artista
- Filtros por rangos numéricos múltiples:
  - **Energy** (Energía): 0.0 - 1.0
  - **Danceability** (Bailabilidad): 0.0 - 1.0
  - **Popularity** (Popularidad): 0 - 100
- Simulación de búsqueda tipo MongoDB usando operadores PostgreSQL

### 2. **Framework de Agregación**
- Estadísticas por género musical:
  - Promedio de tempo (BPM)
  - Promedio de energía
  - Promedio de popularidad
  - Conteo de canciones por género
- Top 10 canciones más populares

### 3. **Sistema de Autenticación**
- Registro y login de usuarios
- Autenticación JWT via Supabase Auth
- Sistema de roles (usuario/admin)
- Protección de rutas por rol

### 4. **Panel de Administración (CRUD)**
- **Crear:** Añadir nuevas pistas con validación
- **Buscar:** Búsqueda integrada para encontrar pistas
- **Actualizar:** Editar datos de pistas existentes
- **Eliminar:** Borrado de pistas con confirmación
- Acceso exclusivo para administradores

---

## 🗄️ Estructura de la Base de Datos

### Tabla: `tracks`
Almacena información detallada de las pistas de Spotify.

| Campo | Tipo | Descripción | Rango/Formato |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único (PK) | Auto-generado |
| `name` | TEXT | Nombre de la canción | Requerido, max 200 chars |
| `artist_name` | TEXT | Nombre del artista | Requerido, max 200 chars |
| `year` | INTEGER | Año de lanzamiento | 1900 - Año actual |
| `genre` | TEXT | Género musical | Requerido, max 100 chars |
| `popularity` | INTEGER | Índice de popularidad | 0 - 100 |
| `energy` | NUMERIC | Nivel de energía | 0.0 - 1.0 |
| `danceability` | NUMERIC | Bailabilidad | 0.0 - 1.0 |
| `tempo` | NUMERIC | Tempo en BPM | 0 - 300 |
| `duration_ms` | INTEGER | Duración en milisegundos | > 0 |
| `valence` | NUMERIC | Valencia (positividad) | 0.0 - 1.0 |
| `created_at` | TIMESTAMP | Fecha de creación | Auto-generado |
| `updated_at` | TIMESTAMP | Fecha de actualización | Auto-actualizado |

#### Índices Creados (Optimización):
```sql
-- Índice para búsqueda por nombre y artista (simula índice de texto MongoDB)
CREATE INDEX idx_tracks_name ON tracks(name);
CREATE INDEX idx_tracks_artist ON tracks(artist_name);

-- Índice compuesto para ordenación por popularidad y energía
CREATE INDEX idx_tracks_popularity_energy ON tracks(popularity DESC, energy DESC);

-- Índice para filtrado por año
CREATE INDEX idx_tracks_year ON tracks(year);
```

### Tabla: `profiles`
Almacena información adicional de los usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Referencia a auth.users (PK) |
| `username` | TEXT | Nombre de usuario único |
| `created_at` | TIMESTAMP | Fecha de creación |

### Tabla: `user_roles`
Gestiona los roles de usuario (seguridad crítica).

| Campo | Tipo | Descripción | Valores |
|-------|------|-------------|---------|
| `id` | UUID | Identificador único (PK) | Auto-generado |
| `user_id` | UUID | Referencia a auth.users | FK |
| `role` | ENUM | Rol del usuario | 'user', 'admin' |

#### Función de Seguridad:
```sql
-- Función para verificar rol de admin (usado en RLS)
CREATE FUNCTION is_admin(user_id uuid) RETURNS boolean
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1 AND role = 'admin'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### Políticas de Seguridad (RLS - Row Level Security)

**Tracks:**
- SELECT: Acceso público (cualquiera puede ver)
- INSERT/UPDATE/DELETE: Solo administradores

**Profiles:**
- SELECT: Acceso público
- INSERT/UPDATE: Solo el propio usuario

**User_roles:**
- SELECT: Acceso público
- INSERT: Solo administradores

---

## 🔌 API / Rutas de la Aplicación

### Frontend Routes

| Ruta | Componente | Acceso | Descripción |
|------|-----------|--------|-------------|
| `/` | Index | Público | Página de inicio |
| `/auth` | Auth | Público | Login/Registro |
| `/explore` | Explore | Público | Búsqueda compleja de pistas |
| `/dashboard` | Dashboard | Público | Estadísticas y agregaciones |
| `/admin` | Admin | Solo Admin | Panel CRUD completo |

### Backend Queries (Supabase Client)

#### 1. **Búsqueda Compleja (GET /tracks con filtros)**
```typescript
// Simulación de consulta MongoDB con múltiples filtros
let query = supabase.from("tracks").select("*");

// Búsqueda de texto (equivalente a $text en MongoDB)
if (searchQuery) {
  query = query.or(
    `name.ilike.%${searchQuery}%,artist_name.ilike.%${searchQuery}%`
  );
}

// Filtros de rango (equivalente a $gte, $lte en MongoDB)
query = query
  .gte("energy", minEnergy)
  .lte("energy", maxEnergy)
  .gte("danceability", minDanceability)
  .lte("danceability", maxDanceability)
  .gte("popularity", minPopularity)
  .lte("popularity", maxPopularity);

const { data, error } = await query;
```

**Equivalente MongoDB:**
```javascript
db.tracks.find({
  $text: { $search: "love" },
  energy: { $gte: 0.8, $lte: 1.0 },
  danceability: { $gte: 0.5, $lte: 1.0 },
  popularity: { $gte: 50, $lte: 100 }
})
```

#### 2. **Agregación por Género (Framework de Agregación)**
```typescript
// Función PostgreSQL que simula pipeline de agregación MongoDB
const { data, error } = await supabase.rpc("get_genre_stats");
```

**Definición de la función:**
```sql
CREATE FUNCTION get_genre_stats()
RETURNS TABLE(
  genre text,
  avg_tempo numeric,
  avg_energy numeric,
  avg_popularity numeric,
  count bigint
) AS $$
  SELECT 
    genre,
    ROUND(AVG(tempo)::numeric, 2) as avg_tempo,
    ROUND(AVG(energy)::numeric, 2) as avg_energy,
    ROUND(AVG(popularity)::numeric, 2) as avg_popularity,
    COUNT(*) as count
  FROM tracks
  GROUP BY genre
  ORDER BY count DESC, avg_popularity DESC;
$$ LANGUAGE sql STABLE;
```

**Equivalente MongoDB:**
```javascript
db.tracks.aggregate([
  {
    $group: {
      _id: "$genre",
      avg_tempo: { $avg: "$tempo" },
      avg_energy: { $avg: "$energy" },
      avg_popularity: { $avg: "$popularity" },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1, avg_popularity: -1 }
  }
])
```

#### 3. **CRUD Operaciones (Admin)**

**CREATE:**
```typescript
const { error } = await supabase.from("tracks").insert([trackData]);
```

**UPDATE:**
```typescript
const { error } = await supabase
  .from("tracks")
  .update(trackData)
  .eq("id", trackId);
```

**DELETE:**
```typescript
const { error } = await supabase
  .from("tracks")
  .delete()
  .eq("id", trackId);
```

---

## 🔐 Variables de Entorno

El archivo `.env` contiene las credenciales de Supabase (generado automáticamente):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[ANON_KEY]
VITE_SUPABASE_PROJECT_ID=[PROJECT_ID]
```

⚠️ **IMPORTANTE:** Este archivo NO debe editarse manualmente. Se actualiza automáticamente por la integración de Lovable Cloud.

---

## 🚀 Instalación y Ejecución

### Prerequisitos
- Node.js 18+ y npm
- Cuenta de Lovable (para backend)

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd spotify-explorer

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Compilar para Producción

```bash
npm run build
```

---

## 👤 Crear Usuario Administrador

Para acceder al panel de administración, debes asignar el rol de admin a un usuario:

1. **Registrar un usuario** desde `/auth`
2. **Obtener el ID del usuario** desde Lovable Cloud > Backend > Profiles
3. **Ejecutar esta query** en Lovable Cloud > Backend > SQL Editor:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('[USER_ID_AQUI]', 'admin');
```

4. Cerrar sesión y volver a iniciar sesión
5. El menú "Admin" ahora será visible

---

## 📊 Patrones de Diseño Similares a MongoDB

Aunque este proyecto usa PostgreSQL, implementa patrones que simulan operaciones MongoDB:

| Operación MongoDB | Implementación PostgreSQL | Ubicación |
|-------------------|---------------------------|-----------|
| `$text` search | `ILIKE` con OR | `TrackSearchList.tsx`, `Explore.tsx` |
| `$gte`, `$lte` | `.gte()`, `.lte()` | Filtros de rango |
| `$group` + `$avg` | `GROUP BY` + `AVG()` | Función `get_genre_stats()` |
| `$sort` | `.order()` / `ORDER BY` | Todas las queries |
| `$or` | `.or()` | Búsqueda de texto |

---

## 🎨 Diseño y Colores

El proyecto usa una paleta inspirada en el logo:
- **Verde brillante** (#00ff00): Elementos principales y acentos
- **Azul oscuro** (hsl(200, 50%, 5%)): Fondos
- **Azul intermedio**: Tarjetas y componentes secundarios

Colores definidos en `src/index.css` usando tokens CSS:
```css
--primary: 120 100% 50%;     /* Verde brillante */
--background: 200 50% 5%;    /* Azul oscuro */
--accent: 120 100% 45%;      /* Verde acento */
```

---

## 📚 Tecnologías Utilizadas

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **TanStack Query** - Gestión de estado asíncrono
- **React Router** - Navegación
- **Zod** - Validación de schemas
- **Recharts** - Gráficos

### Backend (Lovable Cloud)
- **Supabase** - Base de datos PostgreSQL
- **Supabase Auth** - Autenticación JWT
- **Row Level Security (RLS)** - Seguridad a nivel de fila

### Desarrollo
- **Vite** - Build tool
- **ESLint** - Linting

---

## 📝 Documentación de Consultas

### Consulta 1: Búsqueda Compleja Multi-Campo
**Propósito:** Buscar canciones por texto y múltiples rangos numéricos  
**Archivo:** `src/components/TrackSearchList.tsx`, `src/pages/Explore.tsx`  
**Parámetros:**
- `searchQuery` (string): Texto a buscar en nombre o artista
- `minEnergy`, `maxEnergy` (number): Rango de energía 0-1
- `minDanceability`, `maxDanceability` (number): Rango de bailabilidad 0-1
- `minPopularity`, `maxPopularity` (number): Rango de popularidad 0-100

**Uso:**
```typescript
// Buscar canciones con "love" en el título, energía alta y popularidad media
searchQuery = "love"
minEnergy = 0.8, maxEnergy = 1.0
minPopularity = 50, maxPopularity = 100
```

### Consulta 2: Agregación de Estadísticas por Género
**Propósito:** Calcular promedios y conteos agrupados por género  
**Archivo:** `src/pages/Dashboard.tsx`  
**Función:** `get_genre_stats()`  
**Retorna:**
- `genre`: Género musical
- `avg_tempo`: Promedio de BPM
- `avg_energy`: Promedio de energía
- `avg_popularity`: Promedio de popularidad
- `count`: Número de canciones

**Uso:**
```typescript
const { data: genreStats } = await supabase.rpc("get_genre_stats");
```

### Consulta 3: Top 10 Canciones Populares
**Propósito:** Obtener las 10 canciones más populares  
**Archivo:** `src/pages/Dashboard.tsx`  
**Query:**
```typescript
const { data } = await supabase
  .from("tracks")
  .select("*")
  .order("popularity", { ascending: false })
  .limit(10);
```

### Consulta 4: CRUD Operaciones (Admin)
**Archivo:** `src/pages/Admin.tsx`

**CREATE:** Validación con Zod + inserción
```typescript
const validation = trackSchema.safeParse(data);
await supabase.from("tracks").insert([data]);
```

**UPDATE:** Búsqueda + actualización
```typescript
await supabase.from("tracks").update(data).eq("id", trackId);
```

**DELETE:** Confirmación + eliminación
```typescript
await supabase.from("tracks").delete().eq("id", trackId);
```

---

## 🔒 Seguridad Implementada

1. **Autenticación JWT**: Tokens seguros via Supabase Auth
2. **RLS Policies**: Restricciones a nivel de base de datos
3. **Validación Client-Side**: Schemas Zod para formularios
4. **Validación Server-Side**: Constraints y tipos en PostgreSQL
5. **Roles Separados**: Tabla `user_roles` independiente (prevención de escalada de privilegios)
6. **Security Definer Functions**: Funciones con privilegios elevados para verificaciones seguras

---

## 📖 Referencias y Documentación

- **Supabase Docs:** https://supabase.com/docs
- **React Query:** https://tanstack.com/query/latest
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com
- **Zod Validation:** https://zod.dev

---

## 👨‍💻 Desarrollo y Contribución

### Estructura del Proyecto
```
src/
├── assets/              # Imágenes y assets estáticos
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes UI (shadcn)
│   ├── Navbar.tsx      # Barra de navegación
│   └── TrackSearchList.tsx  # Lista de búsqueda de pistas
├── contexts/           # React Contexts
│   └── AuthContext.tsx # Gestión de autenticación
├── integrations/       # Integraciones externas
│   └── supabase/       # Cliente y tipos de Supabase
├── lib/                # Utilidades
├── pages/              # Páginas de la aplicación
│   ├── Index.tsx       # Página de inicio
│   ├── Auth.tsx        # Login/Registro
│   ├── Explore.tsx     # Búsqueda pública
│   ├── Dashboard.tsx   # Estadísticas
│   └── Admin.tsx       # Panel CRUD
└── main.tsx            # Entrada de la aplicación
```

### Scripts Disponibles
```json
{
  "dev": "Servidor de desarrollo",
  "build": "Compilar para producción",
  "preview": "Vista previa de producción",
  "lint": "Ejecutar ESLint"
}
```

---

## 📦 Entrega del Proyecto

**Formato:** ZIP  
**Nombre:** `EFMAI_APELLIDO1_APELLIDO2_NOMBRE`

**Contenido del ZIP:**
1. Código fuente completo
2. Este README.md con documentación
3. Archivo de migraciones SQL (en `supabase/migrations/`)
4. Capturas de pantalla de la aplicación funcionando

---

## ✅ Checklist de Requisitos del Ejercicio

- ✅ Base de datos creada y documentada (PostgreSQL/Supabase)
- ✅ Índices creados para optimización
- ✅ Interfaz de interacción (SPA React + TypeScript)
- ✅ Búsqueda y filtrado complejo (varios campos simultáneos)
- ✅ Framework de agregación (función `get_genre_stats`)
- ✅ Operaciones de escritura (CRUD completo en Admin)
- ✅ Autenticación y autorización implementadas
- ✅ Documentación de consultas y estructura
- ✅ Sistema de roles para seguridad

---

## 📧 Soporte

Para preguntas o problemas técnicos, contactar al desarrollador o revisar la documentación de Lovable: https://docs.lovable.dev

---

**Última actualización:** Noviembre 2024  
**Versión:** 1.0.0
