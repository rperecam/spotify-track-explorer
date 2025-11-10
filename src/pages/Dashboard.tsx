// ============================================================================
// Página: Dashboard Analítico Expandido
// Descripción: Visualización completa de estadísticas, métricas y gráficos interactivos
// ============================================================================

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Music, TrendingUp, Clock, AlertCircle, User, Zap, Heart, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// ============================================================================
// Interfaces de tipos de datos
// ============================================================================

interface GenreStats {
  genre: string;
  avg_tempo: number;
  avg_energy: number;
  avg_popularity: number;
  count: number;
}

interface Track {
  id: string;
  name: string;
  artist_name: string;
  album_name?: string;
  genre: string;
  explicit: boolean;
  duration_ms: number;
  popularity: number;
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
}

interface ArtistStats {
  artist_name: string;
  track_count: number;
  avg_popularity: number;
}

interface ExplicitByGenre {
  genre: string;
  explicit_count: number;
  total_count: number;
  explicit_percentage: number;
}

// ============================================================================
// Funciones auxiliares para métricas derivadas
// ============================================================================

const getEnergyLevel = (energy: number): string => {
  if (energy < 0.4) return "Baja";
  if (energy < 0.7) return "Media";
  return "Alta";
};

const getMood = (valence: number): string => {
  if (valence < 0.4) return "Triste";
  if (valence < 0.6) return "Neutra";
  return "Feliz";
};

const Dashboard = () => {
  // ============================================================================
  // Queries de datos
  // ============================================================================

// Query 1
const { data: stats, isLoading } = useQuery({
  queryKey: ["genre-stats"],
  queryFn: api.getGenreStats,
});

// Query 2
const { data: allTracks } = useQuery({
  queryKey: ["all-tracks"],
  queryFn: api.getAllTracks,
});

// Query 3
const { data: topTracks } = useQuery({
  queryKey: ["top-tracks"],
  queryFn: async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/top-popular?limit=10`);
    if (!res.ok) throw new Error('Error al obtener top pistas');
    return res.json();
  },
});


// Query 4
const { data: artistStats } = useQuery({
  queryKey: ["artist-stats"],
  queryFn: api.getArtistStats,
});

// Query 5
const { data: explicitByGenre } = useQuery({
  queryKey: ["explicit-by-genre"],
  queryFn: api.getExplicitByGenre,
});

// Query 6
const { data: explicitStats } = useQuery({
  queryKey: ["explicit-stats"],
  queryFn: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/explicit-stats`);
    if (!response.ok) throw new Error("Error al obtener estadísticas");
    return await response.json();
  },
});


  // ============================================================================
  // Cálculos de métricas globales
  // ============================================================================

  const totalTracks = stats?.reduce((acc, s) => acc + s.count, 0) || 0;
  const totalGenres = stats?.length || 0;
  const avgPopularity = stats
    ? Math.round(stats.reduce((acc, s) => acc + s.avg_popularity, 0) / stats.length)
    : 0;

  // Duración media en minutos
  const avgDuration = allTracks
    ? (allTracks.reduce((acc, t) => acc + t.duration_ms, 0) / allTracks.length / 60000).toFixed(2)
    : "0.00";

  // Porcentaje de canciones explícitas
  const explicitCount = explicitStats?.explicitCount || 0;
  const explicitPercentage = explicitStats?.explicitPercentage || 0;

  // Género con mayor popularidad media
  const topGenreByPopularity = stats?.reduce((prev, current) =>
    prev.avg_popularity > current.avg_popularity ? prev : current
  )?.genre || "N/A";

  // Artista con más canciones
  const topArtistByCount = artistStats?.[0];

  // ============================================================================
  // Datos para visualizaciones
  // ============================================================================

  // Histograma de popularidad (rangos de 10)
  const popularityHistogram = allTracks
    ? Array.from({ length: 10 }, (_, i) => {
        const rangeStart = i * 10;
        const rangeEnd = (i + 1) * 10;
        const count = allTracks.filter(
          (t) => t.popularity >= rangeStart && t.popularity < rangeEnd
        ).length;
        return {
          range: `${rangeStart}-${rangeEnd}`,
          count,
        };
      })
    : [];

  // Dispersión energía vs bailabilidad (sample de 100 canciones)
  const energyDanceData = allTracks
    ?.slice(0, 100)
    .map((t) => ({
      energy: parseFloat((t.energy * 100).toFixed(1)),
      danceability: parseFloat((t.danceability * 100).toFixed(1)),
      name: t.name,
      popularity: t.popularity,
    })) || [];

  // Distribución por nivel de energía
  const energyLevelDistribution = allTracks
    ? [
        {
          level: "Baja",
          count: allTracks.filter((t) => getEnergyLevel(t.energy) === "Baja").length,
        },
        {
          level: "Media",
          count: allTracks.filter((t) => getEnergyLevel(t.energy) === "Media").length,
        },
        {
          level: "Alta",
          count: allTracks.filter((t) => getEnergyLevel(t.energy) === "Alta").length,
        },
      ]
    : [];

  // Distribución por mood
  const moodDistribution = allTracks
    ? [
        {
          mood: "Triste",
          count: allTracks.filter((t) => getMood(t.valence) === "Triste").length,
        },
        {
          mood: "Neutra",
          count: allTracks.filter((t) => getMood(t.valence) === "Neutra").length,
        },
        {
          mood: "Feliz",
          count: allTracks.filter((t) => getMood(t.valence) === "Feliz").length,
        },
      ]
    : [];

  // ============================================================================
  // Colores para gráficos
  // ============================================================================

  const COLORS = {
    primary: "hsl(45, 100%, 51%)",
    secondary: "hsl(0, 0%, 20%)",
    accent: "hsl(45, 90%, 60%)",
    muted: "hsl(0, 0%, 40%)",
  };

  // ============================================================================
  // Renderizado del componente
  // ============================================================================

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard Analítico Completo
          </h1>
          <p className="text-muted-foreground">
            Análisis exhaustivo de estadísticas, métricas y visualizaciones interactivas
          </p>
        </div>

        {/* Métricas Globales Principales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pistas</CardTitle>
              <Music className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTracks}</div>
              <p className="text-xs text-muted-foreground mt-1">En la base de datos</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Géneros</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalGenres}</div>
              <p className="text-xs text-muted-foreground mt-1">Géneros únicos</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Popularidad Media</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgPopularity}</div>
              <p className="text-xs text-muted-foreground mt-1">Promedio general</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Duración Media</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgDuration}</div>
              <p className="text-xs text-muted-foreground mt-1">Minutos promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Globales Nuevas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Canciones Explícitas</CardTitle>
              <AlertCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{explicitPercentage}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {explicitCount} de {totalTracks} pistas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Género Más Popular</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{topGenreByPopularity}</div>
              <p className="text-xs text-muted-foreground mt-1">Mayor popularidad media</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Artista Top</CardTitle>
              <User className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">
                {topArtistByCount?.artist_name || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {topArtistByCount?.track_count || 0} canciones
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Análisis Completo</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{allTracks?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Datos procesados</p>
            </CardContent>
          </Card>
        </div>

        {/* Visualizaciones Interactivas - Fila 1 */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Histograma de Popularidad */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Distribución de Popularidad</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularityHistogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 30%)" />
                  <XAxis dataKey="range" stroke="hsl(0, 0%, 70%)" />
                  <YAxis stroke="hsl(0, 0%, 70%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 12%)",
                      border: "1px solid hsl(0, 0%, 25%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Dispersión Energía vs Bailabilidad */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Energía vs Bailabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 30%)" />
                  <XAxis
                    dataKey="energy"
                    name="Energía"
                    stroke="hsl(0, 0%, 70%)"
                    label={{ value: "Energía (%)", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    dataKey="danceability"
                    name="Bailabilidad"
                    stroke="hsl(0, 0%, 70%)"
                    label={{ value: "Bailabilidad (%)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 12%)",
                      border: "1px solid hsl(0, 0%, 25%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Scatter data={energyDanceData} fill={COLORS.primary} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Visualizaciones Interactivas - Fila 2 */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Distribución por Nivel de Energía */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Distribución por Nivel de Energía</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={energyLevelDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 30%)" />
                  <XAxis dataKey="level" stroke="hsl(0, 0%, 70%)" />
                  <YAxis stroke="hsl(0, 0%, 70%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 12%)",
                      border: "1px solid hsl(0, 0%, 25%)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{
                      color: "hsl(0, 0%, 100%)",
                    }}
                    itemStyle={{
                      color: "hsl(45, 100%, 51%)",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {energyLevelDistribution.map((entry, index) => (
                      <Cell
                        key={`energy-${entry.level}-${index}`}
                        fill={
                          index === 0
                            ? "hsl(210, 100%, 60%)"
                            : index === 1
                            ? COLORS.accent
                            : "hsl(0, 100%, 60%)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución por Mood */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Distribución por Estado de Ánimo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moodDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 30%)" />
                  <XAxis dataKey="mood" stroke="hsl(0, 0%, 70%)" />
                  <YAxis stroke="hsl(0, 0%, 70%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 12%)",
                      border: "1px solid hsl(0, 0%, 25%)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{
                      color: "hsl(0, 0%, 100%)",
                    }}
                    itemStyle={{
                      color: "hsl(45, 100%, 51%)",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {moodDistribution.map((entry, index) => (
                      <Cell
                        key={`mood-${entry.mood}-${index}`}
                        fill={
                          index === 0
                            ? "hsl(220, 80%, 50%)"
                            : index === 1
                            ? "hsl(0, 0%, 60%)"
                            : "hsl(60, 100%, 50%)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Rankings y Estadísticas por Género */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
         {/* Top Artistas por Cantidad de Tracks */}
         <Card className="shadow-[var(--shadow-card)]">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               Top Artistas por Tracks
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-3">
               {artistStats?.slice(0, 10).map((artist, idx) => (
                 <div
                   key={idx}
                   className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                 >
                   <div className="flex items-center gap-3">
                     <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                       {idx + 1}
                     </span>
                     <span className="font-medium">
                       {Array.isArray(artist.artist_name)
                         ? artist.artist_name[0]
                         : artist.artist_name}
                     </span>
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <Music className="h-4 w-4" />
                     <span className="font-semibold">{artist.track_count} tracks</span>
                   </div>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
          {/* Estadísticas por Género */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Estadísticas por Género</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Cargando...</p>
              ) : (
                <div className="space-y-4">
                  {stats?.slice(0, 5).map((stat) => (
                    <div key={`genre-${stat.genre}-${stat.count}`} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{stat.genre}</span>
                        <span className="text-muted-foreground">{stat.count} pistas</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-background p-2 rounded border border-border">
                          <div className="text-muted-foreground">Tempo</div>
                          <div className="font-bold">{Math.round(stat.avg_tempo)}</div>
                        </div>
                        <div className="bg-background p-2 rounded border border-border">
                          <div className="text-muted-foreground">Energía</div>
                          <div className="font-bold">{Math.round(stat.avg_energy * 100)}%</div>
                        </div>
                        <div className="bg-background p-2 rounded border border-border">
                          <div className="text-muted-foreground">Pop</div>
                          <div className="font-bold">{Math.round(stat.avg_popularity)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rankings Finales */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top 5 Géneros con Más Canciones Explícitas */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Top 5 Géneros con Más Canciones Explícitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {explicitByGenre?.slice(0, 5).map((genre, index) => (
                  <div
                    key={`explicit-${genre.genre}-${index}`}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{genre.genre}</p>
                      <p className="text-sm text-muted-foreground">
                        {genre.explicit_count} de {genre.total_count} canciones
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {genre.explicit_percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">Explícito</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Pistas Más Populares */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Top 5 Tracks Más Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {topTracks?.map((track: Track, index: number) => (
                  <div
                    key={`top-track-${track.id}`}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{track.popularity}</div>
                      <div className="text-xs text-muted-foreground">Pop</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;