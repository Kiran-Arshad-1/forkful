-- Create vendor_accounts table linking auth users to vendor listings
CREATE TABLE IF NOT EXISTS public.vendor_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  role text DEFAULT 'owner',
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_accounts_user_id ON public.vendor_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_accounts_vendor_id ON public.vendor_accounts(vendor_id);

-- Enable RLS
ALTER TABLE public.vendor_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "vendor_accounts_insert_own" ON public.vendor_accounts;
CREATE POLICY "vendor_accounts_insert_own"
  ON public.vendor_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "vendor_accounts_select_own" ON public.vendor_accounts;
CREATE POLICY "vendor_accounts_select_own"
  ON public.vendor_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "vendor_accounts_update_own" ON public.vendor_accounts;
CREATE POLICY "vendor_accounts_update_own"
  ON public.vendor_accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
