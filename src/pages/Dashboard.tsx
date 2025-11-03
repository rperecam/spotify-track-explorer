import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Music, TrendingUp } from "lucide-react";

interface GenreStats {
  genre: string;
  avg_tempo: number;
  avg_energy: number;
  avg_popularity: number;
  count: number;
}

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["genre-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_genre_stats");
      
      if (error) throw error;
      return data as unknown as GenreStats[];
    },
  });

  const { data: topTracks } = useQuery({
    queryKey: ["top-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("popularity", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard Analítico
          </h1>
          <p className="text-muted-foreground">
            Agregaciones y estadísticas de las pistas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pistas</CardTitle>
              <Music className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.reduce((acc, s) => acc + s.count, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En la base de datos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Géneros</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Géneros únicos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Popularidad Media</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats
                  ? Math.round(
                      stats.reduce((acc, s) => acc + s.avg_popularity, 0) / stats.length
                    )
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Promedio general
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Estadísticas por Género</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Cargando...</p>
              ) : (
                <div className="space-y-4">
                  {stats?.slice(0, 8).map((stat) => (
                    <div key={stat.genre} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{stat.genre}</span>
                        <span className="text-muted-foreground">{stat.count} pistas</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-secondary p-2 rounded">
                          <div className="text-muted-foreground">Tempo Medio</div>
                          <div className="font-bold">{Math.round(stat.avg_tempo)}</div>
                        </div>
                        <div className="bg-secondary p-2 rounded">
                          <div className="text-muted-foreground">Energía</div>
                          <div className="font-bold">{Math.round(stat.avg_energy * 100)}%</div>
                        </div>
                        <div className="bg-secondary p-2 rounded">
                          <div className="text-muted-foreground">Popularidad</div>
                          <div className="font-bold">{Math.round(stat.avg_popularity)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Top 10 Pistas Más Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTracks?.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist_name}</p>
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
