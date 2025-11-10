// ============================================================================
// Página: Explorador de Pistas
// Descripción: Interfaz de búsqueda y filtrado avanzado de pistas musicales
// ============================================================================

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, Music, TrendingUp, Activity } from "lucide-react";
import { TrackDetailDrawer } from "@/components/TrackDetailDrawer";

// ============================================================================
// Interfaces de tipos de datos
// ============================================================================

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

interface TracksResponse {
  tracks: Track[];
}

const Explore = () => {
  // ========================================================================
  // Estados: Query de búsqueda y filtros
  // ========================================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    minEnergy: 0,
    maxEnergy: 1,
    minDanceability: 0,
    maxDanceability: 1,
    minPopularity: 0,
    maxPopularity: 100,
  });

  // Estado para el drawer de detalle
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ========================================================================
  // Paginación y query
  // ========================================================================

  const [offset, setOffset] = useState(0);
  const LIMIT = 15;

  const { data: tracksData, isLoading, isFetching: isFetchingNextPage } = useQuery<TracksResponse>({
    queryKey: ["explore-tracks", searchQuery, filters, offset],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);

      params.append("energy_min", filters.minEnergy.toString());
      params.append("energy_max", filters.maxEnergy.toString());
      params.append("danceability_min", filters.minDanceability.toString());
      params.append("danceability_max", filters.maxDanceability.toString());
      params.append("popularity_min", filters.minPopularity.toString());
      params.append("popularity_max", filters.maxPopularity.toString());
      params.append("limit", LIMIT.toString());
      params.append("skip", offset.toString());

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tracks?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener las pistas");
      }

      return await response.json();
    },
  });

  // ========================================================================
  // Estado acumulado de pistas
  // ========================================================================

  const [allTracks, setAllTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (tracksData?.tracks) {
      if (offset === 0) {
        setAllTracks(tracksData.tracks);
      } else {
        setAllTracks((prev) => [...prev, ...tracksData.tracks]);
      }
    }
  }, [tracksData, offset]);

  // Resetear cuando cambien filtros o búsqueda
  useEffect(() => {
    setOffset(0);
    setAllTracks([]);
  }, [searchQuery, filters]);

  const hasMore = tracksData?.tracks?.length === LIMIT;

  const handleLoadMore = () => {
    setOffset((prev) => prev + LIMIT);
  };

  // ========================================================================
  // Función auxiliar: Formatear duración
  // ========================================================================

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  // ========================================================================
  // Renderizado
  // ========================================================================

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Explorador de Pistas
          </h1>
          <p className="text-muted-foreground">
            Busca y filtra pistas musicales con opciones avanzadas
          </p>
        </div>

        {/* Panel de Filtros */}
        <Card className="shadow-[var(--shadow-card)] mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Campo de búsqueda */}
              <div className="space-y-2">
                <Label htmlFor="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar por nombre o artista
                </Label>
                <Input
                  id="search"
                  placeholder="Escribe el nombre de una canción o artista..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filtros numéricos */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Energía */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Energía ({Math.round(filters.minEnergy * 100)} -{" "}
                    {Math.round(filters.maxEnergy * 100)})
                  </Label>
                  <Slider
                    value={[filters.minEnergy * 100, filters.maxEnergy * 100]}
                    onValueChange={(values) =>
                      setFilters({
                        ...filters,
                        minEnergy: values[0] / 100,
                        maxEnergy: values[1] / 100,
                      })
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Bailabilidad */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Bailabilidad ({Math.round(filters.minDanceability * 100)} -{" "}
                    {Math.round(filters.maxDanceability * 100)})
                  </Label>
                  <Slider
                    value={[
                      filters.minDanceability * 100,
                      filters.maxDanceability * 100,
                    ]}
                    onValueChange={(values) =>
                      setFilters({
                        ...filters,
                        minDanceability: values[0] / 100,
                        maxDanceability: values[1] / 100,
                      })
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Popularidad */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popularidad ({filters.minPopularity} - {filters.maxPopularity})
                  </Label>
                  <Slider
                    value={[filters.minPopularity, filters.maxPopularity]}
                    onValueChange={(values) =>
                      setFilters({
                        ...filters,
                        minPopularity: values[0],
                        maxPopularity: values[1],
                      })
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Reset Filtros */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      minEnergy: 0,
                      maxEnergy: 1,
                      minDanceability: 0,
                      maxDanceability: 1,
                      minPopularity: 0,
                      maxPopularity: 100,
                    });
                  }}
                >
                  Resetear Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-4">
          {isLoading && offset === 0 ? (
            <Card className="shadow-[var(--shadow-card)]">
              <CardContent className="py-12">
                <p className="text-muted-foreground text-center">
                  Cargando pistas...
                </p>
              </CardContent>
            </Card>
          ) : allTracks && allTracks.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {allTracks.length} pista{allTracks.length !== 1 ? "s" : ""}{" "}
                  {hasMore ? "cargadas" : "encontradas"}
                </p>
              </div>

              {allTracks.map((track) => (
                <Card
                  key={`explore-track-${track.id}`}
                  className="hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTrack(track);
                    setIsDrawerOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">
                            {track.name}
                          </h3>
                          {track.explicit && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-destructive/20 text-destructive rounded">
                              E
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {track.artist_name}
                          {track.album_name && ` • ${track.album_name}`}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            {track.genre}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Popularidad: {track.popularity}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            Energía: {Math.round(track.energy * 100)}
                          </span>
                          <span>
                            Bailabilidad: {Math.round(track.danceability * 100)}
                          </span>
                          <span>Tempo: {Math.round(track.tempo)} BPM</span>
                          <span>Duración: {formatDuration(track.duration_ms)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    size="lg"
                  >
                    {isFetchingNextPage ? "Cargando..." : "Cargar más"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="shadow-[var(--shadow-card)]">
              <CardContent className="py-12">
                <p className="text-muted-foreground text-center">
                  No se encontraron pistas con los filtros aplicados
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Drawer de detalle de pista */}
      <TrackDetailDrawer
        track={selectedTrack}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  );
};

export default Explore;
