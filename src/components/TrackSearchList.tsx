// ============================================================================
// Componente: Lista de Búsqueda de Pistas
// Descripción: Permite buscar y filtrar pistas con opciones avanzadas
// ============================================================================

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Edit2, Trash2 } from "lucide-react";

interface Track {
  id: string;
  name: string;
  artist_name: string;
  genre: string;
  popularity: number;
  energy: number;
  danceability: number;
  tempo: number;
  duration_ms: number;
  valence: number;
}

interface TrackSearchListProps {
  onEdit: (track: Track) => void;
  onDelete: (id: string) => void;
}

export const TrackSearchList = ({ onEdit, onDelete }: TrackSearchListProps) => {
  // Estado: Query de búsqueda de texto
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estado: Filtros numéricos para energía, bailabilidad y popularidad
  const [filters, setFilters] = useState({
    minEnergy: 0,
    maxEnergy: 1,
    minDanceability: 0,
    maxDanceability: 1,
    minPopularity: 0,
    maxPopularity: 100,
  });

  // Query: Obtener pistas filtradas desde Supabase
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["search-tracks", searchQuery, filters],
    queryFn: async () => {
      let query = supabase.from("tracks").select("*");

      // Búsqueda de texto por nombre o artista
      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,artist_name.ilike.%${searchQuery}%`
        );
      }

      // Aplicar filtros numéricos de rango
      query = query
        .gte("energy", filters.minEnergy)
        .lte("energy", filters.maxEnergy)
        .gte("danceability", filters.minDanceability)
        .lte("danceability", filters.maxDanceability)
        .gte("popularity", filters.minPopularity)
        .lte("popularity", filters.maxPopularity);

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as Track[];
    },
  });

  // Función: Formatear duración de milisegundos a minutos:segundos
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar por nombre o artista
              </Label>
              <Input
                id="search"
                placeholder="Buscar canciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Filtro de Energía: Muestra valores de 0-100 sin símbolo de porcentaje */}
              <div className="space-y-2">
                <Label>Energía ({Math.round(filters.minEnergy * 100)} - {Math.round(filters.maxEnergy * 100)})</Label>
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

              {/* Filtro de Bailabilidad: Muestra valores de 0-100 sin símbolo de porcentaje */}
              <div className="space-y-2">
                <Label>Bailabilidad ({Math.round(filters.minDanceability * 100)} - {Math.round(filters.maxDanceability * 100)})</Label>
                <Slider
                  value={[filters.minDanceability * 100, filters.maxDanceability * 100]}
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

              {/* Filtro de Popularidad: Muestra valores de 0-100 sin símbolo de porcentaje */}
              <div className="space-y-2">
                <Label>Popularidad ({filters.minPopularity} - {filters.maxPopularity})</Label>
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
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Cargando...</p>
        ) : tracks && tracks.length > 0 ? (
          tracks.map((track) => (
            <Card
              key={track.id}
              className="hover:shadow-[var(--shadow-hover)] transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{track.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {track.artist_name} • {track.genre}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Popularidad: {track.popularity}</span>
                      <span>Energía: {track.energy.toFixed(2)}</span>
                      <span>Bailabilidad: {track.danceability.toFixed(2)}</span>
                      <span>Tempo: {track.tempo.toFixed(0)} BPM</span>
                      <span>Duración: {formatDuration(track.duration_ms)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(track)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("¿Eliminar esta pista?")) {
                          onDelete(track.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No se encontraron resultados
          </p>
        )}
      </div>
    </div>
  );
};
