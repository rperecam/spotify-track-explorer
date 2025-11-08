// ============================================================================
// Componente: Panel de Administración
// Descripción: Gestión CRUD de pistas musicales (acceso solo para administradores)
// ============================================================================

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { TrackSearchList } from "@/components/TrackSearchList";
import { Switch } from "@/components/ui/switch";

const trackSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200, "Nombre muy largo"),
  artist_name: z.string().min(1, "Artista requerido").max(200, "Nombre muy largo"),
  album_name: z.string().optional(),
  genre: z.string().min(1, "Género requerido").max(100, "Género muy largo"),
  explicit: z.boolean().optional(),
  duration_ms: z.number().int().min(0),
  popularity: z.number().int().min(0).max(100),
  danceability: z.number().min(0).max(1),
  energy: z.number().min(0).max(1),
  valence: z.number().min(0).max(1),
  tempo: z.number().min(0).max(300),
});

interface TrackForm {
  name: string;
  artist_name: string;
  album_name?: string;
  genre: string;
  explicit?: boolean;
  duration_ms: number;
  popularity: number;
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
}

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TrackForm>({
    name: "",
    artist_name: "",
    album_name: "",
    genre: "",
    explicit: false,
    duration_ms: 180000,
    popularity: 50,
    danceability: 0.5,
    energy: 0.5,
    valence: 0.5,
    tempo: 120,
  });

  // Redirigir si el usuario no es administrador
  if (!authLoading && !isAdmin) {
    navigate("/explore");
    return null;
  }

  const createMutation = useMutation({
    mutationFn: async (data: TrackForm) => {
      const validation = trackSchema.safeParse(data);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { error } = await supabase.from("tracks").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-tracks"] });
      toast.success("Pista creada exitosamente");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TrackForm }) => {
      const validation = trackSchema.safeParse(data);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { error } = await supabase.from("tracks").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-tracks"] });
      toast.success("Pista actualizada exitosamente");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tracks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-tracks"] });
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
      album_name: "",
      genre: "",
      explicit: false,
      duration_ms: 180000,
      popularity: 50,
      danceability: 0.5,
      energy: 0.5,
      valence: 0.5,
      tempo: 120,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (track: any) => {
    setFormData({
      name: track.name,
      artist_name: track.artist_name,
      album_name: track.album_name || "",
      genre: track.genre,
      explicit: track.explicit || false,
      duration_ms: track.duration_ms,
      popularity: track.popularity,
      danceability: track.danceability,
      energy: track.energy,
      valence: track.valence,
      tempo: track.tempo,
    });
    setIsEditing(true);
    setEditingId(track.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Panel de Administración
            </span>
          </h1>
          <p className="text-muted-foreground">
            Gestión CRUD de pistas (solo administradores)
          </p>
        </div>

        <Card className="mb-8 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isEditing ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {isEditing ? "Editar Pista" : "Crear Nueva Pista"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Campo: Nombre de la pista */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                {/* Campo: Nombre del artista */}
                <div className="space-y-2">
                  <Label htmlFor="artist_name">Artista</Label>
                  <Input
                    id="artist_name"
                    value={formData.artist_name}
                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                {/* Campo: Nombre del álbum */}
                <div className="space-y-2">
                  <Label htmlFor="album_name">Álbum</Label>
                  <Input
                    id="album_name"
                    value={formData.album_name || ""}
                    onChange={(e) => setFormData({ ...formData, album_name: e.target.value })}
                    maxLength={200}
                  />
                </div>

                {/* Campo: Género musical */}
                <div className="space-y-2">
                  <Label htmlFor="genre">Género</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>

                {/* Campo: Contenido explícito */}
                <div className="space-y-2">
                  <Label htmlFor="explicit">Contenido explícito</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      id="explicit"
                      checked={formData.explicit || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, explicit: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.explicit ? "Sí" : "No"}
                    </span>
                  </div>
                </div>

                {/* Campo: Popularidad (0-100) */}
                <div className="space-y-2">
                  <Label htmlFor="popularity">Popularidad (0-100)</Label>
                  <Input
                    id="popularity"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.popularity}
                    onChange={(e) => setFormData({ ...formData, popularity: parseInt(e.target.value) })}
                    required
                  />
                </div>

                {/* Campo: Energía (0-1) */}
                <div className="space-y-2">
                  <Label htmlFor="energy">Energía (0-1)</Label>
                  <Input
                    id="energy"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.energy}
                    onChange={(e) => setFormData({ ...formData, energy: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                {/* Campo: Bailabilidad (0-1) */}
                <div className="space-y-2">
                  <Label htmlFor="danceability">Bailabilidad (0-1)</Label>
                  <Input
                    id="danceability"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.danceability}
                    onChange={(e) => setFormData({ ...formData, danceability: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                {/* Campo: Tempo en BPM */}
                <div className="space-y-2">
                  <Label htmlFor="tempo">Tempo (BPM)</Label>
                  <Input
                    id="tempo"
                    type="number"
                    step="0.01"
                    min="0"
                    max="300"
                    value={formData.tempo}
                    onChange={(e) => setFormData({ ...formData, tempo: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                {/* Campo: Duración en milisegundos */}
                <div className="space-y-2">
                  <Label htmlFor="duration_ms">Duración (ms)</Label>
                  <Input
                    id="duration_ms"
                    type="number"
                    min="0"
                    value={formData.duration_ms}
                    onChange={(e) => setFormData({ ...formData, duration_ms: parseInt(e.target.value) })}
                    required
                  />
                </div>

                {/* Campo: Valencia emocional (0-1) */}
                <div className="space-y-2">
                  <Label htmlFor="valence">Valencia (0-1)</Label>
                  <Input
                    id="valence"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.valence}
                    onChange={(e) => setFormData({ ...formData, valence: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {isEditing ? "Actualizar" : "Crear"}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Buscar y Gestionar Pistas</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackSearchList onEdit={handleEdit} onDelete={handleDelete} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
