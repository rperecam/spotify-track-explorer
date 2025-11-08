// ============================================================================
// Página: Panel de Administración
// Descripción: CRUD completo de pistas con búsqueda y validación
// ============================================================================

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { z } from "zod";

const API_URL = import.meta.env.VITE_API_URL;

// Schema de validación para pistas
const trackSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  artist_name: z.string().min(1, "El artista es requerido").max(255),
  genre: z.string().min(1, "El género es requerido").max(100),
  popularity: z.number().min(0).max(100),
  energy: z.number().min(0).max(1),
  danceability: z.number().min(0).max(1),
  tempo: z.number().min(0),
  duration_ms: z.number().min(0),
  valence: z.number().min(0).max(1),
  explicit: z.boolean(),
});

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
  explicit: boolean;
}

interface TrackFormData {
  name: string;
  artist_name: string;
  genre: string;
  popularity: number;
  energy: number;
  danceability: number;
  tempo: number;
  duration_ms: number;
  valence: number;
  explicit: boolean;
}

const Admin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<TrackFormData>({
    name: "",
    artist_name: "",
    genre: "",
    popularity: 50,
    energy: 0.5,
    danceability: 0.5,
    tempo: 120,
    duration_ms: 180000,
    valence: 0.5,
    explicit: false,
  });

  // Query: Obtener todas las pistas con búsqueda
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["admin-tracks", searchQuery],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const url = searchQuery
        ? `${API_URL}/tracks?search=${encodeURIComponent(searchQuery)}`
        : `${API_URL}/tracks`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al cargar pistas');
      const data = await res.json();
      return data.tracks as Track[];
    },
  });

  // Mutation: Crear nueva pista
  const createMutation = useMutation({
    mutationFn: async (data: TrackFormData) => {
      const validation = trackSchema.safeParse(data);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear pista');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Pista creada exitosamente");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation: Actualizar pista existente
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TrackFormData }) => {
      const validation = trackSchema.safeParse(data);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/tracks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al actualizar pista');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Pista actualizada exitosamente");
      setIsDialogOpen(false);
      setEditingTrack(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation: Eliminar pista
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/tracks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al eliminar pista');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Pista eliminada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      artist_name: "",
      genre: "",
      popularity: 50,
      energy: 0.5,
      danceability: 0.5,
      tempo: 120,
      duration_ms: 180000,
      valence: 0.5,
      explicit: false,
    });
  };

  const handleEdit = (track: Track) => {
    setEditingTrack(track);
    setFormData({
      name: track.name,
      artist_name: track.artist_name,
      genre: track.genre,
      popularity: track.popularity,
      energy: track.energy,
      danceability: track.danceability,
      tempo: track.tempo,
      duration_ms: track.duration_ms,
      valence: track.valence,
      explicit: track.explicit,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrack) {
      updateMutation.mutate({ id: editingTrack.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta pista?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Gestión completa de pistas musicales
          </p>
        </div>

        <Card className="mb-6 shadow-[var(--shadow-card)]">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o artista..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingTrack(null);
                      resetForm();
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva Pista
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTrack ? "Editar Pista" : "Nueva Pista"}
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="artist_name">Artista *</Label>
                        <Input
                          id="artist_name"
                          value={formData.artist_name}
                          onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="genre">Género *</Label>
                        <Input
                          id="genre"
                          value={formData.genre}
                          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="popularity">Popularidad (0-100)</Label>
                        <Input
                          id="popularity"
                          type="number"
                          min={0}
                          max={100}
                          value={formData.popularity}
                          onChange={(e) => setFormData({ ...formData, popularity: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="energy">Energía (0-1)</Label>
                        <Input
                          id="energy"
                          type="number"
                          step={0.01}
                          min={0}
                          max={1}
                          value={formData.energy}
                          onChange={(e) => setFormData({ ...formData, energy: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="danceability">Bailabilidad (0-1)</Label>
                        <Input
                          id="danceability"
                          type="number"
                          step={0.01}
                          min={0}
                          max={1}
                          value={formData.danceability}
                          onChange={(e) => setFormData({ ...formData, danceability: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tempo">Tempo (BPM)</Label>
                        <Input
                          id="tempo"
                          type="number"
                          min={0}
                          value={formData.tempo}
                          onChange={(e) => setFormData({ ...formData, tempo: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration_ms">Duración (ms)</Label>
                        <Input
                          id="duration_ms"
                          type="number"
                          min={0}
                          value={formData.duration_ms}
                          onChange={(e) => setFormData({ ...formData, duration_ms: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valence">Valencia (0-1)</Label>
                        <Input
                          id="valence"
                          type="number"
                          step={0.01}
                          min={0}
                          max={1}
                          value={formData.valence}
                          onChange={(e) => setFormData({ ...formData, valence: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="explicit" className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="explicit"
                            checked={formData.explicit}
                            onChange={(e) => setFormData({ ...formData, explicit: e.target.checked })}
                          />
                          Contenido explícito
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingTrack ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Cargando...</p>
          ) : tracks && tracks.length > 0 ? (
            tracks.map((track) => (
              <Card key={`admin-track-${track.id}`} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{track.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {track.artist_name} • {track.genre}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Pop: {track.popularity}</span>
                        <span>Energía: {track.energy.toFixed(2)}</span>
                        <span>Baile: {track.danceability.toFixed(2)}</span>
                        <span>Tempo: {track.tempo.toFixed(0)} BPM</span>
                        <span>{formatDuration(track.duration_ms)}</span>
                        {track.explicit && <span className="text-destructive">Explícito</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(track)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(track.id)}
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
              No se encontraron pistas
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;