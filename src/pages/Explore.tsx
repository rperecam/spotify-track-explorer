// ============================================================================
// Página: Explorador de Pistas
// Descripción: Búsqueda avanzada de pistas musicales con filtros complejos
// ============================================================================

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, Music2 } from "lucide-react";
import { toast } from "sonner";

interface Track {
  id: string;
  name: string;
  artist_name: string;
  year: number;
  genre: string;
  popularity: number;
  energy: number;
  danceability: number;
  tempo: number;
  duration_ms: number;
  valence: number;
}

interface SearchFilters {
  query: string;
  minEnergy: number;
  maxEnergy: number;
  minDanceability: number;
  maxDanceability: number;
  minPopularity: number;
  maxPopularity: number;
}

const Explore = () => {
  // Estado: Filtros temporales (se aplican al hacer click en "Buscar")
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    minEnergy: 0,
    maxEnergy: 100,
    minDanceability: 0,
    maxDanceability: 100,
    minPopularity: 0,
    maxPopularity: 100,
  });

  // Estado: Filtros activos aplicados a la query
  const [activeFilters, setActiveFilters] = useState<SearchFilters>(filters);

  // Query: Buscar pistas con filtros activos
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["tracks", activeFilters],
    queryFn: async () => {
      let query = supabase.from("tracks").select("*");

      // Aplicar búsqueda de texto
      if (activeFilters.query) {
        query = query.or(
          `name.ilike.%${activeFilters.query}%,artist_name.ilike.%${activeFilters.query}%`
        );
      }

      // Aplicar filtros numéricos de rango
      query = query
        .gte("energy", activeFilters.minEnergy / 100)
        .lte("energy", activeFilters.maxEnergy / 100)
        .gte("danceability", activeFilters.minDanceability / 100)
        .lte("danceability", activeFilters.maxDanceability / 100)
        .gte("popularity", activeFilters.minPopularity)
        .lte("popularity", activeFilters.maxPopularity)
        .order("popularity", { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (error) {
        toast.error("Error al buscar pistas");
        throw error;
      }

      return data as Track[];
    },
  });

  // Handler: Aplicar filtros a la búsqueda
  const handleSearch = () => {
    setActiveFilters(filters);
  };

  // Función: Formatear duración de milisegundos a minutos:segundos
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Explorador de Pistas
          </h1>
          <p className="text-muted-foreground">
            Búsqueda avanzada con filtros múltiples
          </p>
        </div>

        <Card className="mb-8 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Buscar por nombre o artista</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Love, Beatles..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                />
                <Button onClick={handleSearch} className="gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Filtro de Energía */}
              <div className="space-y-2">
                <Label>Energía ({filters.minEnergy} - {filters.maxEnergy})</Label>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[filters.minEnergy, filters.maxEnergy]}
                  onValueChange={([min, max]) =>
                    setFilters({ ...filters, minEnergy: min, maxEnergy: max })
                  }
                  className="mt-2"
                />
              </div>

              {/* Filtro de Bailabilidad */}
              <div className="space-y-2">
                <Label>Bailabilidad ({filters.minDanceability} - {filters.maxDanceability})</Label>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[filters.minDanceability, filters.maxDanceability]}
                  onValueChange={([min, max]) =>
                    setFilters({ ...filters, minDanceability: min, maxDanceability: max })
                  }
                  className="mt-2"
                />
              </div>

              {/* Filtro de Popularidad */}
              <div className="space-y-2">
                <Label>Popularidad ({filters.minPopularity} - {filters.maxPopularity})</Label>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[filters.minPopularity, filters.maxPopularity]}
                  onValueChange={([min, max]) =>
                    setFilters({ ...filters, minPopularity: min, maxPopularity: max })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <Music2 className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando pistas...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {tracks?.length || 0} pistas encontradas
            </h2>
            
            <div className="grid gap-4">
              {tracks?.map((track) => (
                <Card key={track.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <h3 className="text-xl font-semibold">{track.name}</h3>
                        <p className="text-muted-foreground">{track.artist_name}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                          <span>{track.genre}</span>
                          <span>•</span>
                          <span>{formatDuration(track.duration_ms)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="text-center p-2 bg-primary/10 rounded-lg">
                          <div className="text-xs text-muted-foreground">Pop</div>
                          <div className="text-lg font-bold text-primary">{track.popularity}</div>
                        </div>
                        <div className="text-center p-2 bg-secondary rounded-lg">
                          <div className="text-xs text-muted-foreground">Energy</div>
                          <div className="text-lg font-bold">{Math.round(track.energy * 100)}</div>
                        </div>
                        <div className="text-center p-2 bg-secondary rounded-lg">
                          <div className="text-xs text-muted-foreground">Dance</div>
                          <div className="text-lg font-bold">{Math.round(track.danceability * 100)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
