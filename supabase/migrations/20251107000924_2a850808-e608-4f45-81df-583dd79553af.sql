-- Add missing columns to tracks table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='album_name') THEN
    ALTER TABLE tracks ADD COLUMN album_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='explicit') THEN
    ALTER TABLE tracks ADD COLUMN explicit BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create function to get artist stats
CREATE OR REPLACE FUNCTION get_artist_stats()
RETURNS TABLE (
  artist_name TEXT,
  track_count BIGINT,
  avg_popularity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.artist_name,
    COUNT(*)::BIGINT as track_count,
    ROUND(AVG(t.popularity)::NUMERIC, 2) as avg_popularity
  FROM tracks t
  GROUP BY t.artist_name
  ORDER BY track_count DESC, avg_popularity DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get explicit stats by genre
CREATE OR REPLACE FUNCTION get_explicit_by_genre()
RETURNS TABLE (
  genre TEXT,
  explicit_count BIGINT,
  total_count BIGINT,
  explicit_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.genre,
    COUNT(*) FILTER (WHERE t.explicit = true)::BIGINT as explicit_count,
    COUNT(*)::BIGINT as total_count,
    ROUND((COUNT(*) FILTER (WHERE t.explicit = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2) as explicit_percentage
  FROM tracks t
  GROUP BY t.genre
  HAVING COUNT(*) FILTER (WHERE t.explicit = true) > 0
  ORDER BY explicit_count DESC;
END;
$$ LANGUAGE plpgsql;