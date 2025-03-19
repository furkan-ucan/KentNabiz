-- PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Create a test table for spatial data
CREATE TABLE IF NOT EXISTS spatial_test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    location GEOMETRY(Point, 4326)
);

-- Insert a sample point
INSERT INTO spatial_test (name, location) 
VALUES ('Test Point', ST_SetSRID(ST_MakePoint(28.9784, 41.0082), 4326))
ON CONFLICT DO NOTHING;

-- Grant privileges
ALTER TABLE spatial_test OWNER TO dev; 