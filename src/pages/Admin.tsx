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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { z } from "zod";

const API_URL = import.meta.env.VITE_API_URL;

// ============================================================================
// Schema de validación con Zod
// ============================================================================
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
  num_artists: z.number().min(1),
});

// ============================================================================
// Interfaces TypeScript
// ============================================================================
interface Track {
  id: string;
  name: string;
  artist_name: string | string[];
  genre: string;
  popularity: number;
  energy: number;
  danceability: number;
  tempo: number;
  duration_ms: number;
  valence: number;
  explicit: boolean;
  num_artists?: number;
}

interface TrackFormData {
  name: string;
  artist_name: string | string[];
  genre: string;
  popularity: number;
  energy: number;
  danceability: number;
  tempo: number;
  duration_ms: number;
  valence: number;
  explicit: boolean;
  num_artists: number;
}

// ============================================================================
// Componente Principal
// ============================================================================
const Admin = () => {
  // Hooks y contexto
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Estados locales
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Estado del formulario con valores iniciales
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
    num_artists: 1,
  });

  // ============================================================================
  // Query: Obtener todas las pistas con búsqueda
  // ============================================================================
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

  // ============================================================================
  // Mutation: Crear nueva pista
  // ============================================================================
  const createMutation = useMutation({
    mutationFn: async (data: TrackFormData) => {
      // Validar datos con Zod
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

  // ============================================================================
  // Mutation: Actualizar pista existente
  // ============================================================================
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TrackFormData }) => {
      // Validar datos con Zod
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

  // ============================================================================
  // Mutation: Eliminar pista
  // ============================================================================
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

  // ============================================================================
  // Funciones auxiliares
  // ============================================================================

  /**
   * Resetea el formulario a sus valores iniciales
   */
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
      num_artists: 1,
    });
  };

  /**
   * Maneja el cambio de inputs del formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    });
  };

  /**
   * Prepara el formulario para editar una pista
   */
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
      num_artists: track.num_artists || 1,
    });
    setIsDialogOpen(true);
  };

  /**
   * Envía el formulario (crear o actualizar)
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrack) {
      updateMutation.mutate({ id: editingTrack.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

const handleUpdateSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingTrack) return;

  try {
    // Normalizar artist_name: convertir array a string si es necesario
    const normalizedData = {
      ...editingTrack,
      artist_name: Array.isArray(editingTrack.artist_name)
        ? editingTrack.artist_name.join(", ")
        : editingTrack.artist_name
    };

    await api.updateTrack(editingTrack.id, normalizedData);
    queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
    setIsEditDialogOpen(false);
    setEditingTrack(null);
    toast({
      title: "Pista actualizada",
      description: "La pista se actualizó correctamente",
    });
  } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Error al actualizar la pista",
        variant: "destructive",
      });
    }
  };


  /**
   * Elimina una pista con confirmación
   */
  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta pista?")) {
      deleteMutation.mutate(id);
    }
  };

  /**
   * Formatea duración de milisegundos a mm:ss
   */
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  // ============================================================================
  // Protección de ruta - Requiere autenticación
  // ============================================================================
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // ============================================================================
  // Render del componente
  // ============================================================================
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Gestión completa de pistas musicales
          </p>
        </div>

        {/* Barra de búsqueda y botón crear */}
        <Card className="mb-6 shadow-[var(--shadow-card)]">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {/* Input de búsqueda */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o artista..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Diálogo de formulario */}
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

                  {/* Formulario de creación/edición */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Campo: Nombre */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* Campo: Artista */}
                      <div className="space-y-2">
                        <Label htmlFor="artist_name">Artista *</Label>
                        <Input
                          id="artist_name"
                          name="artist_name"
                          value={formData.artist_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* Campo: Género */}
                      <div className="space-y-2">
                        <Label htmlFor="genre">Género *</Label>
                        <Input
                          id="genre"
                          name="genre"
                          value={formData.genre}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* Campo: Popularidad */}
                      <div className="space-y-2">
                        <Label htmlFor="popularity">Popularidad (0-100)</Label>
                        <Input
                          id="popularity"
                          name="popularity"
                          type="number"
                          min={0}
                          max={100}
                          value={formData.popularity}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Campo: Energía */}
                      <div className="space-y-2">
                        <Label htmlFor="energy">Energía (0-1)</Label>
                        <Input
                          id="energy"
                          name="energy"
                          type="number"
                          step={0.01}
                          min={0}
                          max={1}
                          value={formData.energy}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Campo: Bailabilidad */}
                      <div className="space-y-2">
                        <Label htmlFor="danceability">Bailabilidad (0-1)</Label>
                        <Input
                          id="danceability"
                          name="danceability"
                          type="number"
                          step={0.01}
                          min={0}
                          max={1}
                          value={formData.danceability}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Campo: Tempo */}
                      <div className="space-y-2">
                        <Label htmlFor="tempo">Tempo (BPM)</Label>
                        <Input
                          id="tempo"
                          name="tempo"
                          type="number"
                          min={0}
                          value={formData.tempo}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Campo: Duración */}
                      <div className="space-y-2">
                        <Label htmlFor="duration_ms">Duración (ms)</Label>
                        <Input
                          id="duration_ms"
                          name="duration_ms"
                          type="number"
                          min={0}
                          value={formData.duration_ms}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Campo: Valencia */}
                      <div className="space-y-2">
                        <Label htmlFor="valence">Valencia (0-1)</Label>
                        <Input
                          id="valence"
                          name="valence"
                          type="number"
                          step={0.01}
                          min={0}
                          max={1}
                          value={formData.valence}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Campo: Número de Artistas */}
                      <div className="space-y-2">
                        <Label htmlFor="num_artists">Número de Artistas</Label>
                        <Input
                          id="num_artists"
                          name="num_artists"
                          type="number"
                          min="1"
                          value={formData.num_artists}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Campo: Contenido Explícito (checkbox) */}
                    <div className="space-y-2">
                      <Label htmlFor="explicit">Contenido Explícito</Label>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Checkbox
                          id="explicit"
                          checked={formData.explicit}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, explicit: checked as boolean })
                          }
                        />
                        <Label
                          htmlFor="explicit"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Esta pista contiene lenguaje explícito
                        </Label>
                      </div>
                    </div>

                    {/* Botones de acción */}
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

        {/* Lista de pistas */}
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Cargando...</p>
          ) : tracks && tracks.length > 0 ? (
            tracks.map((track) => (
              <Card key={`admin-track-${track.id}`} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Información de la pista */}
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

                    {/* Botones de acción */}
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