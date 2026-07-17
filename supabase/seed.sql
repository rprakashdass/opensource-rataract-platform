-- Create the storage bucket used by the app
INSERT INTO storage.buckets (id, name, public)
VALUES ('rotaract-media', 'rotaract-media', true)
ON CONFLICT (id) DO NOTHING;
