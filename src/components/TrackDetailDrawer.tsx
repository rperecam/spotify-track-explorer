// ============================================================================
// Componente: Drawer de Detalle de Pista
// Descripción: Muestra todos los detalles de una pista en un drawer lateral
// ============================================================================

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Music, TrendingUp, Activity, Clock, Gauge, Heart, Users } from "lucide-react";

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

interface TrackDetailDrawerProps {
  track: Track | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TrackDetailDrawer = ({
  track,
  open,
  onOpenChange,
}: TrackDetailDrawerProps) => {
  if (!track) return null;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  const getValenceLabel = (valence: number) => {
    if (valence >= 0.7) return "Muy Positivo";
    if (valence >= 0.5) return "Positivo";
    if (valence >= 0.3) return "Neutral";
    return "Melancólico";
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-2xl overflow-y-auto">
          <DrawerHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DrawerTitle className="text-2xl font-bold mb-2">
                  {track.name}
                </DrawerTitle>
                <DrawerDescription className="text-lg">
                  {track.artist_name}
                </DrawerDescription>
              </div>
              {track.explicit && (
                <Badge variant="destructive" className="flex-shrink-0">
                  Explícito
                </Badge>
              )}
            </div>
          </DrawerHeader>

          <div className="p-6 space-y-6">
            {/* Información del álbum y género */}
            {track.album_name && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Álbum</p>
                <p className="text-base font-medium">{track.album_name}</p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Género</p>
              <Badge variant="secondary" className="text-sm">
                <Music className="h-3 w-3 mr-1" />
                {track.genre}
              </Badge>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Popularidad
                </div>
                <p className="text-2xl font-bold">{track.popularity}</p>
                <div className="w-full bg-background rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${track.popularity}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Duración
                </div>
                <p className="text-2xl font-bold">
                  {formatDuration(track.duration_ms)}
                </p>
              </div>
            </div>

            {/* Características musicales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Características Musicales</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4" />
                      Energía
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(track.energy * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${track.energy * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Music className="h-4 w-4" />
                      Bailabilidad
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(track.danceability * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${track.danceability * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4" />
                      Estado de Ánimo
                    </div>
                    <span className="text-sm font-medium">
                      {getValenceLabel(track.valence)} ({Math.round(track.valence * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${track.valence * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gauge className="h-4 w-4" />
                    Tempo
                  </div>
                  <p className="text-xl font-bold">{Math.round(track.tempo)} BPM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
