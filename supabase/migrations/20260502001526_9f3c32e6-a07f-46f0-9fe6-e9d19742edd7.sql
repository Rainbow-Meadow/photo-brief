INSERT INTO storage.buckets (id, name, public) VALUES ('marketing-assets', 'marketing-assets', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access on marketing-assets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'marketing-assets');

CREATE POLICY "Service role upload on marketing-assets" ON storage.objects FOR INSERT TO service_role WITH CHECK (bucket_id = 'marketing-assets');

CREATE POLICY "Service role update on marketing-assets" ON storage.objects FOR UPDATE TO service_role USING (bucket_id = 'marketing-assets');
