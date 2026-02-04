-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is authenticated staff (admin or staff role)
CREATE OR REPLACE FUNCTION public.is_authenticated_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
  )
$$;

-- RLS policy for user_roles: users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop existing permissive policies on appointments
DROP POLICY IF EXISTS "Allow all operations on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Appointments are publicly viewable" ON public.appointments;

-- New RLS policies for appointments: only authenticated staff can access
CREATE POLICY "Staff can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (public.is_authenticated_staff());

CREATE POLICY "Staff can insert appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Staff can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (public.is_authenticated_staff())
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Staff can delete appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (public.is_authenticated_staff());

-- Drop existing permissive policies on doctor_profiles
DROP POLICY IF EXISTS "Allow all operations on doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Doctor profiles are publicly viewable" ON public.doctor_profiles;

-- New RLS policies for doctor_profiles: public read for non-sensitive fields, staff write
-- Public can view doctor profiles (name, specialization, bio - contact info should be hidden in app logic)
CREATE POLICY "Doctor profiles are publicly viewable"
ON public.doctor_profiles
FOR SELECT
USING (true);

-- Only staff can modify doctor profiles
CREATE POLICY "Staff can insert doctor profiles"
ON public.doctor_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Staff can update doctor profiles"
ON public.doctor_profiles
FOR UPDATE
TO authenticated
USING (public.is_authenticated_staff())
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Staff can delete doctor profiles"
ON public.doctor_profiles
FOR DELETE
TO authenticated
USING (public.is_authenticated_staff());

-- Drop existing permissive policies on doctor_shifts
DROP POLICY IF EXISTS "Allow all operations on doctor shifts" ON public.doctor_shifts;
DROP POLICY IF EXISTS "Doctor shifts are publicly viewable" ON public.doctor_shifts;

-- New RLS policies for doctor_shifts
CREATE POLICY "Doctor shifts are publicly viewable"
ON public.doctor_shifts
FOR SELECT
USING (true);

CREATE POLICY "Staff can insert doctor shifts"
ON public.doctor_shifts
FOR INSERT
TO authenticated
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Staff can update doctor shifts"
ON public.doctor_shifts
FOR UPDATE
TO authenticated
USING (public.is_authenticated_staff())
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Staff can delete doctor shifts"
ON public.doctor_shifts
FOR DELETE
TO authenticated
USING (public.is_authenticated_staff());

-- Drop existing permissive policies on doctor_shift_assignments
DROP POLICY IF EXISTS "Allow all operations on shift assignments" ON public.doctor_shift_assignments;
DROP POLICY IF EXISTS "Doctor shift assignments are publicly viewable" ON public.doctor_shift_assignments;

-- New RLS policies for doctor_shift_assignments
CREATE POLICY "Shift assignments are publicly viewable"
ON public.doctor_shift_assignments
FOR SELECT
USING (true);

CREATE POLICY "Staff can insert shift assignments"
ON public.doctor_shift_assignments
FOR INSERT
TO authenticated
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Staff can update shift assignments"
ON public.doctor_shift_assignments
FOR UPDATE
TO authenticated
USING (public.is_authenticated_staff())
WITH CHECK (public.is_authenticated_staff());

CREATE POLICY "Staff can delete shift assignments"
ON public.doctor_shift_assignments
FOR DELETE
TO authenticated
USING (public.is_authenticated_staff());

-- Create a trigger to auto-assign staff role on first user registration
-- (For initial setup - in production, roles should be assigned by admins)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is the first user (make them admin)
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    -- Subsequent users get staff role
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();