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

const trackSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200, "Nombre muy largo"),
  artist_name: z.string().min(1, "Artista requerido").max(200, "Nombre muy largo"),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  genre: z.string().min(1, "Género requerido").max(100, "Género muy largo"),
  popularity: z.number().int().min(0).max(100),
  energy: z.number().min(0).max(1),
  danceability: z.number().min(0).max(1),
  tempo: z.number().min(0).max(300),
  duration_ms: z.number().int().min(0),
  valence: z.number().min(0).max(1),
});

interface TrackForm {
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

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TrackForm>({
    name: "",
    artist_name: "",
    year: new Date().getFullYear(),
    genre: "",
    popularity: 50,
    energy: 0.5,
    danceability: 0.5,
    tempo: 120,
    duration_ms: 180000,
    valence: 0.5,
  });

  // Redirect if not admin
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
      year: new Date().getFullYear(),
      genre: "",
      popularity: 50,
      energy: 0.5,
      danceability: 0.5,
      tempo: 120,
      duration_ms: 180000,
      valence: 0.5,
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
      year: track.year,
      genre: track.genre,
      popularity: track.popularity,
      energy: track.energy,
      danceability: track.danceability,
      tempo: track.tempo,
      duration_ms: track.duration_ms,
      valence: track.valence,
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
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artist_name">Artista *</Label>
                  <Input
                    id="artist_name"
                    value={formData.artist_name}
                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Año *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
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
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="popularity">Popularidad (0-100) *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="energy">Energía (0-1) *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="danceability">Bailabilidad (0-1) *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="tempo">Tempo (BPM) *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="duration_ms">Duración (ms) *</Label>
                  <Input
                    id="duration_ms"
                    type="number"
                    min="0"
                    value={formData.duration_ms}
                    onChange={(e) => setFormData({ ...formData, duration_ms: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valence">Valencia (0-1) *</Label>
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
