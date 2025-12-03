-- Create doctor shifts table linked to doctor profiles
CREATE TABLE public.doctor_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  service_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for many-to-many relationship between shifts and doctors
CREATE TABLE public.doctor_shift_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID NOT NULL REFERENCES public.doctor_shifts(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shift_id, doctor_id)
);

-- Enable Row Level Security
ALTER TABLE public.doctor_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_shift_assignments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Doctor shifts are publicly viewable" 
ON public.doctor_shifts FOR SELECT USING (true);

CREATE POLICY "Doctor shift assignments are publicly viewable" 
ON public.doctor_shift_assignments FOR SELECT USING (true);

-- Allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on doctor shifts" 
ON public.doctor_shifts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on shift assignments" 
ON public.doctor_shift_assignments FOR ALL USING (true) WITH CHECK (true);

-- Trigger for timestamp updates
CREATE TRIGGER update_doctor_shifts_updated_at
BEFORE UPDATE ON public.doctor_shifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();