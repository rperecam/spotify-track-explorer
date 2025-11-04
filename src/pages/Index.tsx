import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, BarChart3, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block mb-4">
            <img src={logo} alt="Music Tracks Explorer Logo" className="h-24 w-24 md:h-32 md:w-32" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Music Tracks Explorer
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Explora, analiza y gestiona pistas de Spotify con búsquedas avanzadas y visualizaciones de datos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {user ? (
              <Link to="/explore">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  Ir al Explorador
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  Comenzar Ahora
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-16">
            <div className="p-6 rounded-xl bg-card shadow-[var(--shadow-card)] space-y-4">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Búsqueda Compleja</h3>
              <p className="text-muted-foreground">
                Filtros avanzados por energía, bailabilidad, popularidad y más
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card shadow-[var(--shadow-card)] space-y-4">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Dashboard Analítico</h3>
              <p className="text-muted-foreground">
                Visualiza estadísticas agregadas y tendencias por género
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card shadow-[var(--shadow-card)] space-y-4">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Panel Admin</h3>
              <p className="text-muted-foreground">
                Gestión CRUD completa con autenticación y roles
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;
