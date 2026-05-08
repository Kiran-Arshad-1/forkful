-- -----------------------------------------------------------------------
-- admin_profiles must be created FIRST because vendor_profiles RLS
-- policies reference it.
-- -----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text        NOT NULL,
  email       text        NOT NULL,
  admin_role  text        NOT NULL DEFAULT 'moderator'
                          CHECK (admin_role IN ('moderator', 'super_admin')),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON public.admin_profiles(user_id);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_profiles_select_own"
  ON public.admin_profiles FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "admin_profiles_super_admin_insert"
  ON public.admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      WHERE ap.user_id = auth.uid() AND ap.admin_role = 'super_admin'
    )
  );

-- -----------------------------------------------------------------------
-- vendor_profiles
-- -----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name   text        NOT NULL,
  full_name       text        NOT NULL,
  email           text        NOT NULL,
  contact_phone   text,
  approval_status text        NOT NULL DEFAULT 'pending'
                              CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  is_listed       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON public.vendor_profiles(user_id);

ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor_profiles_select_own"
  ON public.vendor_profiles FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "vendor_profiles_insert_own"
  ON public.vendor_profiles FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "vendor_profiles_update_own"
  ON public.vendor_profiles FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Admins can read all vendor_profiles (approval workflow)
CREATE POLICY "vendor_profiles_admin_read"
  ON public.vendor_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid()
    )
  );

-- Admins can update vendor_profiles (approve/reject)
CREATE POLICY "vendor_profiles_admin_update"
  ON public.vendor_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------
-- Trigger: keep updated_at current on vendor_profiles
-- -----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vendor_profiles_updated_at ON public.vendor_profiles;
CREATE TRIGGER trg_vendor_profiles_updated_at
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
