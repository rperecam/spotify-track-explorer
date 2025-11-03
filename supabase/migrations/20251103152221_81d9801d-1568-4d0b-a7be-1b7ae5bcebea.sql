-- Create function to get genre statistics (aggregation)
CREATE OR REPLACE FUNCTION public.get_genre_stats()
RETURNS TABLE (
  genre TEXT,
  avg_tempo NUMERIC,
  avg_energy NUMERIC,
  avg_popularity NUMERIC,
  count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    genre,
    ROUND(AVG(tempo)::numeric, 2) as avg_tempo,
    ROUND(AVG(energy)::numeric, 2) as avg_energy,
    ROUND(AVG(popularity)::numeric, 2) as avg_popularity,
    COUNT(*) as count
  FROM public.tracks
  GROUP BY genre
  ORDER BY count DESC, avg_popularity DESC;
$$;