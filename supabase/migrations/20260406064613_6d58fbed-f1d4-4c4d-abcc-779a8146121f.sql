-- Update transaction policies to share data between all authenticated family members
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Family can view all transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Family can delete all transactions"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Family can update all transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);