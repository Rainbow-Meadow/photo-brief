
CREATE TABLE public.beta_welcome_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  business_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  brand_color TEXT,
  tagline TEXT,
  logo_description TEXT,
  photo_use_case TEXT,
  monthly_volume TEXT,
  reviewer_info TEXT,
  preferred_channel TEXT,
  template_ideas TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_welcome_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages beta welcome submissions"
  ON public.beta_welcome_submissions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
