
CREATE TABLE public.vocabulary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  word_class TEXT NOT NULL DEFAULT 'other',
  node TEXT NOT NULL,
  example TEXT,
  source_note TEXT,
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

-- Single-user app, no auth: allow anyone to read/write via the publishable key.
CREATE POLICY "Public can read vocabulary" ON public.vocabulary FOR SELECT USING (true);
CREATE POLICY "Public can insert vocabulary" ON public.vocabulary FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update vocabulary" ON public.vocabulary FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete vocabulary" ON public.vocabulary FOR DELETE USING (true);

CREATE INDEX vocabulary_date_added_idx ON public.vocabulary (date_added DESC);
