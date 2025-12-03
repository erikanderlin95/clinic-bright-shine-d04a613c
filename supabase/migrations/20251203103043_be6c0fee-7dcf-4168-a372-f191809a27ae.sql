-- Create doctor profiles table
CREATE TABLE public.doctor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT, -- e.g. "Senior Consultant", "General Practitioner"
  specialization TEXT,
  certifications TEXT[], -- Array of certifications
  languages TEXT[], -- Array of languages spoken
  years_of_experience INTEGER,
  bio TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for marketplace display)
CREATE POLICY "Doctor profiles are publicly viewable" 
ON public.doctor_profiles 
FOR SELECT 
USING (true);

-- For now, allow all operations (can be restricted to authenticated staff later)
CREATE POLICY "Allow all operations on doctor profiles" 
ON public.doctor_profiles 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_doctor_profiles_updated_at
BEFORE UPDATE ON public.doctor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample doctor data
INSERT INTO public.doctor_profiles (name, title, specialization, certifications, languages, years_of_experience, bio)
VALUES 
  ('Dr Tan Wei Ming', 'Senior Consultant', 'General Medicine', ARRAY['MBBS (Singapore)', 'MRCP (UK)', 'FAMS'], ARRAY['English', 'Mandarin', 'Hokkien'], 15, 'Dr Tan has over 15 years of experience in general medicine with a focus on chronic disease management.'),
  ('Dr Wong Mei Ling', 'Consultant', 'Family Medicine', ARRAY['MBBS (NUS)', 'MMed (Family Medicine)'], ARRAY['English', 'Mandarin', 'Cantonese'], 10, 'Dr Wong specializes in family medicine and preventive healthcare.'),
  ('Dr Lim Ah Kow', 'Senior Consultant', 'Internal Medicine', ARRAY['MBBS (UK)', 'FRCP (Edinburgh)'], ARRAY['English', 'Mandarin', 'Malay'], 20, 'Dr Lim brings extensive experience in internal medicine and geriatric care.'),
  ('Dr Chen Xiao Wei', 'Associate Consultant', 'Pediatrics', ARRAY['MBBS (Singapore)', 'MRCPCH (UK)'], ARRAY['English', 'Mandarin'], 8, 'Dr Chen is passionate about pediatric care and child development.');